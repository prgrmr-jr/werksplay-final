from django.utils import timezone
from rest_framework.exceptions import ValidationError
from .models import MatchParticipant
from apps.players.models import Player
from apps.games.models import Game
import pytz

WEEKLY_MATCH_LIMIT     = 5
WEEKLY_VS_SAME_PLAYER  = 2
WEEKLY_SAME_GAME_LIMIT = 2

MANILA_TZ = pytz.timezone("Asia/Manila")


def _week_range():
    """
    Return (week_start, now) in UTC where:
      - week_start = most recent Monday at 06:00 AM Asia/Manila, converted to UTC
      - now        = current UTC time

    Matches count toward the week they were SUBMITTED (submitted_at),
    not when they were approved. Weekly counter resets every Monday 6AM Manila.
    """
    now_manila    = timezone.now().astimezone(MANILA_TZ)
    days_since_mon = now_manila.weekday()  # Monday=0 … Sunday=6
    monday_manila  = now_manila - timezone.timedelta(days=days_since_mon)
    week_start_manila = monday_manila.replace(hour=6, minute=0, second=0, microsecond=0)

    # If it's before 6AM on Monday, roll back to previous week's Monday
    if now_manila < week_start_manila:
        week_start_manila -= timezone.timedelta(weeks=1)

    # Convert back to UTC for Django ORM queries
    week_start_utc = week_start_manila.astimezone(pytz.utc)
    return week_start_utc, timezone.now()


def _to_int_list(raw) -> list[int]:
    if isinstance(raw, (list, tuple)):
        return [int(x) for x in raw]
    return [int(raw)]


def _player_name(player_id: int) -> str:
    try:
        return Player.objects.get(pk=player_id).nickname
    except Player.DoesNotExist:
        return str(player_id)


# ── Individual checks ─────────────────────────────────────────────────────────

def check_not_everyone_winner(participant_ids: list[int], winner_ids: list[int]):
    """At least one participant must NOT be a winner."""
    if len(participant_ids) > 1 and set(winner_ids) == set(participant_ids):
        raise ValidationError(
            "Not everyone can be a winner. "
            "Please deselect at least one player from the winners."
        )


def check_game_player_count(game_id: int, participant_count: int):
    """Validate that the number of players fits the game's min/max."""
    try:
        game = Game.objects.get(pk=game_id)
    except Game.DoesNotExist:
        raise ValidationError("Selected game does not exist.")

    label = game.player_count_label

    if participant_count < game.min_players:
        raise ValidationError(
            f"{game.name} requires at least {game.min_players} "
            f"player{'s' if game.min_players != 1 else ''} "
            f"(supports {label} players)."
        )
    if game.max_players is not None and participant_count > game.max_players:
        raise ValidationError(
            f"{game.name} supports a maximum of {game.max_players} "
            f"player{'s' if game.max_players != 1 else ''} "
            f"(supports {label} players). "
            f"You selected {participant_count}."
        )


def check_weekly_limits(participant_ids: list[int], game_id: int,
                        exclude_match_id: int = None):
    """
    Enforce all three weekly limits.

    KEY RULE: counts use submitted_at, NOT approved_at.
    A match submitted on Sunday counts for that Sunday's week
    regardless of when it gets approved.

    Weekly reset: Monday 6:00 AM Asia/Manila.
    """
    week_start, now = _week_range()

    for player_id in participant_ids:
        name = _player_name(player_id)

        # Base queryset: matches submitted this week (any status except Declined)
        # We count Pending + Approved — Declined ones don't consume quota
        base_qs = MatchParticipant.objects.filter(
            player_id=player_id,
            match__submitted_at__range=(week_start, now),
            match__status__in=["Pending", "Approved"],
        )
        if exclude_match_id:
            base_qs = base_qs.exclude(match_id=exclude_match_id)

        # 1 ── Weekly total matches
        total = base_qs.count()
        if total >= WEEKLY_MATCH_LIMIT:
            raise ValidationError(
                f"{name} has already submitted {total} match"
                f"{'es' if total != 1 else ''} this week "
                f"(weekly limit is {WEEKLY_MATCH_LIMIT}). "
                f"Resets Monday 6AM."
            )

        # 2 ── Against same player
        for other_id in participant_ids:
            if other_id == player_id:
                continue
            other_name = _player_name(other_id)
            vs_count = (
                base_qs
                .filter(match__participants__player_id=other_id)
                .distinct()
                .count()
            )
            if vs_count >= WEEKLY_VS_SAME_PLAYER:
                raise ValidationError(
                    f"{name} and {other_name} have already played together "
                    f"{vs_count} time{'s' if vs_count != 1 else ''} this week "
                    f"(limit is {WEEKLY_VS_SAME_PLAYER}). "
                    f"Resets Monday 6AM."
                )

        # 3 ── Same game
        game_count = base_qs.filter(match__game_id=game_id).count()
        if game_count >= WEEKLY_SAME_GAME_LIMIT:
            try:
                game_name = Game.objects.get(pk=game_id).name
            except Game.DoesNotExist:
                game_name = "this game"
            raise ValidationError(
                f"{name} has already submitted {game_name} "
                f"{game_count} time{'s' if game_count != 1 else ''} this week "
                f"(limit is {WEEKLY_SAME_GAME_LIMIT}). "
                f"Resets Monday 6AM."
            )


# ── Master validator ──────────────────────────────────────────────────────────

def validate_match_submission(participant_ids_raw, game_id_raw,
                               winner_ids_raw=None, exclude_match_id=None):
    """
    Full validation pipeline. Called on both submit AND approve.
    Returns (participant_ids: list[int], game_id: int, winner_ids: list[int])
    """
    participant_ids = _to_int_list(participant_ids_raw)
    game_id         = int(game_id_raw)
    winner_ids      = _to_int_list(winner_ids_raw) if winner_ids_raw else []

    check_game_player_count(game_id, len(participant_ids))

    if winner_ids:
        check_not_everyone_winner(participant_ids, winner_ids)

    check_weekly_limits(participant_ids, game_id, exclude_match_id=exclude_match_id)

    return participant_ids, game_id, winner_ids
