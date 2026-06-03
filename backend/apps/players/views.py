from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser, AllowAny
from rest_framework.response import Response

from .models import Player
from .serializers import PlayerSerializer, PlayerListSerializer
from .services import get_player_stats
from apps.matches.models import Match
from apps.matches.serializers import MatchSerializer
from apps.sidequests.models import SideQuest
from apps.sidequests.serializers import SideQuestSerializer
from apps.leaderboard.services import get_player_activity_timeline


class PlayerListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/players/      → public, active players only
    POST /api/players/      → admin only, always saves with is_active=True
    """

    def get_queryset(self):
        return Player.objects.filter(is_active=True)

    def get_serializer_class(self):
        if self.request.method == "POST":
            return PlayerSerializer
        return PlayerListSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAdminUser()]
        return [AllowAny()]

    def perform_create(self, serializer):
        # Force is_active=True regardless of what the client sends
        serializer.save(is_active=True)


class PlayerAdminListView(generics.ListAPIView):
    """
    GET /api/players/all/  → admin only, returns ALL players (active + inactive)
    Used by the Admin Players management page.
    """
    queryset           = Player.objects.all().order_by("fullname")
    serializer_class   = PlayerSerializer
    permission_classes = [IsAdminUser]


class PlayerRetrieveUpdateView(generics.RetrieveUpdateAPIView):
    queryset         = Player.objects.all()
    serializer_class = PlayerSerializer

    def get_permissions(self):
        if self.request.method in ["PUT", "PATCH"]:
            return [IsAdminUser()]
        return [AllowAny()]


@api_view(["GET"])
@permission_classes([AllowAny])
def player_profile_view(request, pk):
    try:
        player = Player.objects.get(pk=pk)
    except Player.DoesNotExist:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    stats = get_player_stats(player)

    recent_matches = Match.objects.filter(
        participants__player=player,
        status="Approved",
    ).distinct().order_by("-approved_at")[:10]

    side_quests = SideQuest.objects.filter(player=player).order_by("-submitted_at")
    timeline    = get_player_activity_timeline(player)

    return Response({
        "player":         PlayerSerializer(player, context={"request": request}).data,
        "stats":          stats,
        "recent_matches": MatchSerializer(recent_matches, many=True, context={"request": request}).data,
        "side_quests":    SideQuestSerializer(side_quests, many=True, context={"request": request}).data,
        "timeline":       timeline,
    })
