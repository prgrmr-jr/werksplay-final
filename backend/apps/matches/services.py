from django.utils import timezone
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Match
from apps.leaderboard.services import award_match_points, revoke_match_points


def approve_match(match: Match, approved_by_user):
    """
    Approve a match and award points.
    Re-approving an already-approved match is a no-op (idempotent).
    """
    if match.status == "Approved":
        return
    match.status      = "Approved"
    match.approved_at = timezone.now()
    match.approved_by = approved_by_user
    match.save()
    award_match_points(match)   # idempotent — guards double-award internally
    _broadcast_match_event("match_approved", match)


def decline_match(match: Match):
    """
    Decline a match. If it was previously Approved, revoke its points.
    """
    if match.status == "Approved":
        revoke_match_points(match)
    match.status = "Declined"
    match.save()
    _broadcast_match_event("match_declined", match)


def _broadcast_match_event(event_type: str, match: Match):
    try:
        layer = get_channel_layer()
        async_to_sync(layer.group_send)(
            "notifications",
            {
                "type":     "notify",
                "event":    event_type,
                "match_id": match.pk,
                "game":     match.game.name,
                "status":   match.status,
            },
        )
    except Exception:
        pass  # Don't crash if channels not running (e.g. runserver without daphne)
