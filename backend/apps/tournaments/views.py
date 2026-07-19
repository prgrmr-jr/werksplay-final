from django.db import IntegrityError
from django.utils import timezone
import pytz
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser, AllowAny
from rest_framework.response import Response

from .models import Tournament, TournamentTeam, TournamentTeamMember, TournamentMatch, TournamentMessage
from .serializers import (
    TournamentSerializer, TournamentDetailSerializer,
    TournamentTeamSerializer, TournamentTeamCreateSerializer,
    TournamentMatchSerializer, TournamentMessageSerializer,
)
from .services import generate_bracket, set_winner, swap_teams

MANILA_TZ = pytz.timezone("Asia/Manila")


# ── Tournament CRUD ───────────────────────────────────────────────────────────

class TournamentListCreateView(generics.ListCreateAPIView):
    queryset = Tournament.objects.select_related("game").prefetch_related("teams")

    def get_serializer_class(self):
        return TournamentSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAdminUser()]
        return [AllowAny()]


class TournamentDetailView(generics.RetrieveUpdateAPIView):
    queryset = Tournament.objects.prefetch_related(
        "teams__members__player", "matches__team_a", "matches__team_b", "matches__winner"
    )

    def get_serializer_class(self):
        return TournamentDetailSerializer

    def get_permissions(self):
        if self.request.method in ["PUT", "PATCH"]:
            return [IsAdminUser()]
        return [AllowAny()]


# ── Team registration (public) ────────────────────────────────────────────────

# @api_view(["POST"])
# @permission_classes([AllowAny])
# def register_team_view(request, pk):
#     try:
#         tournament = Tournament.objects.get(pk=pk)
#     except Tournament.DoesNotExist:
#         return Response({"detail": "Tournament not found."}, status=status.HTTP_404_NOT_FOUND)
#
#     if tournament.status == "Completed":
#         return Response(
#             {"detail": "This tournament has already ended."},
#             status=status.HTTP_400_BAD_REQUEST,
#         )
#
#     # Registration deadline check
#     if tournament.registration_deadline and timezone.now() > tournament.registration_deadline:
#         deadline_str = tournament.registration_deadline.astimezone(MANILA_TZ).strftime("%b %d at %-I:%M %p")
#         return Response(
#             {"detail": f"Team registration closed. Deadline was {deadline_str} (Manila time)."},
#             status=status.HTTP_400_BAD_REQUEST,
#         )
#
#     serializer = TournamentTeamCreateSerializer(
#         data=request.data,
#         context={"tournament": tournament, "request": request},
#     )
#     serializer.is_valid(raise_exception=True)
#     team = serializer.save(tournament=tournament)
#     return Response(TournamentTeamSerializer(team).data, status=status.HTTP_201_CREATED)
@api_view(["POST"])
@permission_classes([AllowAny])
def register_team_view(request, pk):
    try:
        tournament = Tournament.objects.get(pk=pk)
    except Tournament.DoesNotExist:
        return Response({"detail": "Tournament not found."}, status=status.HTTP_404_NOT_FOUND)

    if tournament.status == "Completed":
        return Response(
            {"detail": "This tournament has already ended."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Registration deadline check
    if tournament.registration_deadline and timezone.now() > tournament.registration_deadline:
        deadline_str = tournament.registration_deadline.astimezone(MANILA_TZ).strftime("%b %d at %-I:%M %p")
        return Response(
            {"detail": f"Team registration closed. Deadline was {deadline_str} (Manila time)."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    serializer = TournamentTeamCreateSerializer(
        data=request.data,
        context={"tournament": tournament, "request": request},
    )
    serializer.is_valid(raise_exception=True)

    try:
        team = serializer.save(tournament=tournament)
    except IntegrityError:
        return Response(
            {"name": ["A team with this name is already registered in this tournament."]},
            status=status.HTTP_400_BAD_REQUEST,
        )

    return Response(TournamentTeamSerializer(team).data, status=status.HTTP_201_CREATED)

# ── Public: delete team ───────────────────────────────────────────────────────

@api_view(["DELETE"])
@permission_classes([AllowAny])
def delete_team_view(request, pk, team_id):
    try:
        tournament = Tournament.objects.get(pk=pk)
        team       = TournamentTeam.objects.get(pk=team_id, tournament=tournament)
    except (Tournament.DoesNotExist, TournamentTeam.DoesNotExist):
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    if tournament.status == "Completed":
        return Response(
            {"detail": "Cannot modify teams in a completed tournament."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    team.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


# ── Public: remove a member ───────────────────────────────────────────────────

@api_view(["DELETE"])
@permission_classes([AllowAny])
def remove_member_view(request, pk, team_id, member_id):
    try:
        tournament = Tournament.objects.get(pk=pk)
        team       = TournamentTeam.objects.get(pk=team_id, tournament=tournament)
        member     = TournamentTeamMember.objects.get(pk=member_id, team=team)
    except (Tournament.DoesNotExist, TournamentTeam.DoesNotExist, TournamentTeamMember.DoesNotExist):
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    if tournament.status == "Completed":
        return Response(
            {"detail": "Cannot modify teams in a completed tournament."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    member.delete()
    return Response(TournamentTeamSerializer(team).data)


# ── Public: add a member ──────────────────────────────────────────────────────

@api_view(["POST"])
@permission_classes([AllowAny])
def add_member_view(request, pk, team_id):
    try:
        tournament = Tournament.objects.get(pk=pk)
        team       = TournamentTeam.objects.get(pk=team_id, tournament=tournament)
    except (Tournament.DoesNotExist, TournamentTeam.DoesNotExist):
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    if tournament.status == "Completed":
        return Response(
            {"detail": "Cannot modify teams in a completed tournament."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if team.members.count() >= tournament.team_size:
        return Response(
            {"detail": f"Team is already full ({tournament.team_size}/{tournament.team_size} players)."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    player_id = request.data.get("player_id")
    if not player_id:
        return Response({"detail": "player_id is required."}, status=status.HTTP_400_BAD_REQUEST)

    already_in = TournamentTeamMember.objects.filter(
        team__tournament=tournament, player_id=player_id
    ).select_related("player", "team").first()

    if already_in:
        return Response(
            {"detail": f"{already_in.player.nickname} is already in team '{already_in.team.name}'."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if TournamentTeamMember.objects.filter(team=team, player_id=player_id).exists():
        return Response({"detail": "This player is already in the team."}, status=status.HTTP_400_BAD_REQUEST)

    TournamentTeamMember.objects.create(team=team, player_id=player_id)
    return Response(TournamentTeamSerializer(team).data, status=status.HTTP_201_CREATED)


# ── Chat: message history ─────────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([AllowAny])
def messages_view(request, pk):
    try:
        tournament = Tournament.objects.get(pk=pk)
    except Tournament.DoesNotExist:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
    messages = TournamentMessage.objects.filter(tournament=tournament).order_by("created_at")[:100]
    return Response(TournamentMessageSerializer(messages, many=True).data)


# ── Admin: generate bracket ───────────────────────────────────────────────────

@api_view(["POST"])
@permission_classes([IsAdminUser])
def start_tournament_view(request, pk):
    try:
        tournament = Tournament.objects.get(pk=pk)
    except Tournament.DoesNotExist:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    try:
        generate_bracket(tournament)
    except Exception as e:
        return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    return Response(TournamentDetailSerializer(tournament).data)


# ── Admin: set match winner ───────────────────────────────────────────────────

@api_view(["POST"])
@permission_classes([IsAdminUser])
def set_winner_view(request, pk, match_id):
    try:
        tournament = Tournament.objects.get(pk=pk)
        match      = TournamentMatch.objects.get(pk=match_id, tournament=tournament)
    except (Tournament.DoesNotExist, TournamentMatch.DoesNotExist):
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    winner_id = request.data.get("winner_id")
    if not winner_id:
        return Response({"detail": "winner_id is required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        winning_team = TournamentTeam.objects.get(pk=winner_id)
    except TournamentTeam.DoesNotExist:
        return Response({"detail": "Team not found."}, status=status.HTTP_404_NOT_FOUND)

    try:
        set_winner(match, winning_team)
    except Exception as e:
        return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    return Response(TournamentMatchSerializer(match).data)


# ── Admin: swap teams ─────────────────────────────────────────────────────────

@api_view(["POST"])
@permission_classes([IsAdminUser])
def swap_teams_view(request, pk):
    try:
        tournament = Tournament.objects.get(pk=pk)
    except Tournament.DoesNotExist:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    data       = request.data
    match_id_1 = data.get("match_id_1")
    slot_1     = data.get("slot_1", "a")
    match_id_2 = data.get("match_id_2")
    slot_2     = data.get("slot_2", "a")

    if not all([match_id_1, match_id_2]):
        return Response({"detail": "match_id_1 and match_id_2 are required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        swap_teams(tournament, match_id_1, slot_1, match_id_2, slot_2)
    except Exception as e:
        return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    return Response(TournamentDetailSerializer(tournament).data)
