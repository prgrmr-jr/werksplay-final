from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser, AllowAny
from rest_framework.response import Response

from .models import Match
from .serializers import MatchSerializer, MatchCreateSerializer
from .validators import validate_match_submission
from .services import approve_match, decline_match


class MatchListView(generics.ListAPIView):
    serializer_class   = MatchSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs            = Match.objects.select_related("game", "approved_by").prefetch_related("participants__player")
        status_filter = self.request.query_params.get("status")
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs


class MatchCreateView(generics.CreateAPIView):
    serializer_class   = MatchCreateSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        data = self.request.data

        if hasattr(data, "getlist"):
            participant_ids_raw = data.getlist("participant_ids")
            winner_ids_raw      = data.getlist("winner_ids")
        else:
            participant_ids_raw = data.get("participant_ids", [])
            winner_ids_raw      = data.get("winner_ids", [])

        game_id_raw = data.get("game")

        # Full validation — game count, winner logic, weekly limits, duplicates
        participant_ids, game_id, winner_ids = validate_match_submission(
            participant_ids_raw, game_id_raw, winner_ids_raw
        )

        serializer.save(
            _participant_ids=participant_ids,
            _winner_ids=winner_ids,
        )


class MatchDetailView(generics.RetrieveUpdateAPIView):
    queryset           = Match.objects.prefetch_related("participants__player")
    serializer_class   = MatchSerializer
    permission_classes = [AllowAny]

    def get_permissions(self):
        if self.request.method in ["PUT", "PATCH"]:
            return [IsAdminUser()]
        return [AllowAny()]


@api_view(["POST"])
@permission_classes([IsAdminUser])
def approve_match_view(request, pk):
    try:
        match = Match.objects.get(pk=pk)
    except Match.DoesNotExist:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    # Re-run all validations at approval time too
    participant_ids = list(match.participants.values_list("player_id", flat=True))
    winner_ids      = list(match.participants.filter(is_winner=True).values_list("player_id", flat=True))

    try:
        validate_match_submission(
            participant_ids,
            match.game_id,
            winner_ids,
            exclude_match_id=match.pk,   # don't count this match against itself
        )
    except Exception as e:
        return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    approve_match(match, request.user)
    return Response(MatchSerializer(match).data)


@api_view(["POST"])
@permission_classes([IsAdminUser])
def decline_match_view(request, pk):
    try:
        match = Match.objects.get(pk=pk)
    except Match.DoesNotExist:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
    decline_match(match)
    return Response(MatchSerializer(match).data)
