from django.utils import timezone
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import SideQuest
from apps.leaderboard.services import award_sidequest_points


def approve_sidequest(quest: SideQuest):
    if quest.status != "Pending":
        return
    quest.status      = "Approved"
    quest.approved_at = timezone.now()
    quest.save()
    _broadcast("sidequest_approved", quest)


def decline_sidequest(quest: SideQuest):
    if quest.status in ("Completed",):
        return
    quest.status = "Declined"
    quest.save()
    _broadcast("sidequest_declined", quest)


def submit_completion(quest: SideQuest, proof_image=None, notes=""):
    """
    Public action — anyone can submit completion proof for an Approved quest.
    Moves status to 'Completion Pending' for admin review.
    Does NOT award points yet.
    """
    if quest.status != "Approved":
        return
    if proof_image:
        quest.completion_proof_image = proof_image
    quest.completion_notes        = notes
    quest.completion_submitted_at = timezone.now()
    quest.status                  = "Completion Pending"
    quest.save()
    _broadcast("sidequest_completion_pending", quest)


def complete_sidequest(quest: SideQuest):
    """
    Admin-only action — validates completion and awards points.
    Quest must be in 'Completion Pending' state.
    """
    if quest.status != "Completion Pending":
        return
    quest.status       = "Completed"
    quest.completed_at = timezone.now()
    quest.save()
    award_sidequest_points(quest)
    _broadcast("sidequest_completed", quest)


def _broadcast(event_type: str, quest: SideQuest):
    try:
        layer = get_channel_layer()
        async_to_sync(layer.group_send)(
            "notifications",
            {
                "type":     "notify",
                "event":    event_type,
                "quest_id": quest.pk,
                "player":   quest.player.nickname,
                "status":   quest.status,
            },
        )
    except Exception:
        pass
