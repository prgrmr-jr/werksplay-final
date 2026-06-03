from django.db.models import Sum
from django.conf import settings
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from apps.players.models import Player
from .models import PointsLedger

WINNER_POINTS      = 20
PARTICIPANT_POINTS = 10
SIDEQUEST_POINTS   = 20


# ── Helpers ───────────────────────────────────────────────────────────────────

def _photo_url(player):
    """
    Return a root-relative URL for the player's photo so the Vite proxy
    can forward /media/... to Django's media server.
    e.g.  /media/players/photos/avatar.jpg
    Returns None if no photo is set.
    """
    if not player.photo:
        return None
    # player.photo.url is already root-relative: /media/players/photos/...
    return player.photo.url


# ── Point award / revocation ──────────────────────────────────────────────────

def award_match_points(match):
    """Award points for an approved match. Idempotent."""
    from apps.matches.models import MatchParticipant
    if PointsLedger.objects.filter(source_type="match", source_id=match.pk).exists():
        return
    for p in match.participants.select_related("player").all():
        pts = WINNER_POINTS if p.is_winner else PARTICIPANT_POINTS
        PointsLedger.objects.create(
            player=p.player,
            source_type="match",
            source_id=match.pk,
            points=pts,
        )
    _broadcast_leaderboard_update()


def revoke_match_points(match):
    deleted, _ = PointsLedger.objects.filter(source_type="match", source_id=match.pk).delete()
    if deleted:
        _broadcast_leaderboard_update()


def award_sidequest_points(quest):
    """Award +50 pts for a completed side quest. Idempotent."""
    if PointsLedger.objects.filter(source_type="sidequest", source_id=quest.pk).exists():
        return
    PointsLedger.objects.create(
        player=quest.player,
        source_type="sidequest",
        source_id=quest.pk,
        points=SIDEQUEST_POINTS,
    )
    _broadcast_leaderboard_update()


def revoke_sidequest_points(quest):
    deleted, _ = PointsLedger.objects.filter(source_type="sidequest", source_id=quest.pk).delete()
    if deleted:
        _broadcast_leaderboard_update()


# ── Query helpers ─────────────────────────────────────────────────────────────

def get_player_total_points(player_id: int) -> int:
    result = PointsLedger.objects.filter(player_id=player_id).aggregate(total=Sum("points"))
    return result["total"] or 0


def get_leaderboard(limit: int = 50) -> list:
    from apps.matches.models import MatchParticipant

    players = Player.objects.filter(is_active=True)
    rows = []
    for player in players:
        total          = get_player_total_points(player.pk)
        participations = MatchParticipant.objects.filter(player=player, match__status="Approved")
        matches_played = participations.count()
        wins           = participations.filter(is_winner=True).count()
        losses         = matches_played - wins
        rows.append({
            "player_id":      player.pk,
            "nickname":       player.nickname,
            "fullname":       player.fullname,
            "department":     player.department,
            # Root-relative URL — Vite proxy forwards /media/* to Django
            "photo":          _photo_url(player),
            "total_points":   total,
            "matches_played": matches_played,
            "wins":           wins,
            "losses":         losses,
        })

    rows.sort(key=lambda r: r["total_points"], reverse=True)
    for i, row in enumerate(rows, start=1):
        row["rank"] = i
    return rows[:limit]


def get_player_activity_timeline(player) -> list:
    entries  = PointsLedger.objects.filter(player=player)
    timeline = []
    for entry in entries:
        if entry.source_type == "match":
            try:
                from apps.matches.models import Match
                m     = Match.objects.get(pk=entry.source_id)
                label = f"{'Won' if entry.points == WINNER_POINTS else 'Played'} {m.game.name}"
            except Exception:
                label = f"Match #{entry.source_id}"
        elif entry.source_type == "sidequest":
            label = f"Completed Side Quest #{entry.source_id}"
        else:
            label = "Activity"

        timeline.append({
            "date":   entry.created_at.isoformat(),
            "label":  label,
            "points": entry.points,
        })
    return timeline


# ── WebSocket broadcast ───────────────────────────────────────────────────────

def _broadcast_leaderboard_update():
    try:
        layer = get_channel_layer()
        async_to_sync(layer.group_send)(
            "notifications",
            {"type": "notify", "event": "leaderboard_updated"},
        )
    except Exception:
        pass
