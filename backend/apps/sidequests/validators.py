from rest_framework.exceptions import ValidationError
from .models import SideQuest

MAX_ACTIVE_QUESTS = 2


def validate_sidequest_limit(player_id: int, exclude_quest_id: int = None):
    """
    Ensure a player has fewer than MAX_ACTIVE_QUESTS active (Pending/Approved) quests.
    exclude_quest_id: when validating on approve, exclude the quest being approved
    so it doesn't count against itself.
    """
    from apps.players.models import Player
    try:
        name = Player.objects.get(pk=player_id).nickname
    except Player.DoesNotExist:
        name = f"Player {player_id}"

    qs = SideQuest.objects.filter(
        player_id=player_id,
        status__in=["Pending", "Approved"],
    )
    if exclude_quest_id:
        qs = qs.exclude(pk=exclude_quest_id)

    active_count = qs.count()
    if active_count >= MAX_ACTIVE_QUESTS:
        raise ValidationError(
            f"{name} already has {active_count} active side quest"
            f"{'s' if active_count != 1 else ''} "
            f"(maximum is {MAX_ACTIVE_QUESTS}). "
            "A quest must be completed or declined before a new one can be submitted."
        )


# Keep old name as alias for backwards compat
def validate_sidequest_submission(player_id: int):
    validate_sidequest_limit(player_id)
