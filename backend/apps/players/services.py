from django.db.models import Count, Q, Sum
from apps.players.models import Player
from apps.matches.models import Match, MatchParticipant
from apps.sidequests.models import SideQuest
from apps.leaderboard.services import get_player_total_points


def get_player_stats(player: Player) -> dict:
    """Return aggregated stats for a single player profile page."""
    participants = MatchParticipant.objects.filter(
        player=player,
        match__status="Approved",
    )
    matches_played = participants.count()
    wins = participants.filter(is_winner=True).count()
    losses = matches_played - wins
    win_rate = round((wins / matches_played * 100), 1) if matches_played else 0

    # Most played with (top 10)
    played_with = (
        MatchParticipant.objects.filter(
            match__in=participants.values("match"),
            match__status="Approved",
        )
        .exclude(player=player)
        .values("player__id", "player__nickname", "player__photo")
        .annotate(games_together=Count("id"))
        .order_by("-games_together")[:10]
    )

    # Most played games (top 10)
    played_games = (
        participants.values("match__game__name")
        .annotate(count=Count("id"))
        .order_by("-count")[:10]
    )

    # Side quest stats
    quests_completed = SideQuest.objects.filter(player=player, status="Completed").count()

    total_points = get_player_total_points(player.id)

    return {
        "total_points": total_points,
        "matches_played": matches_played,
        "wins": wins,
        "losses": losses,
        "win_rate": win_rate,
        "quests_completed": quests_completed,
        "most_played_with": list(played_with),
        "most_played_games": list(played_games),
    }
