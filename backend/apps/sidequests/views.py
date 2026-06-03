from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser, AllowAny
from rest_framework.response import Response

from .models import SideQuest
from .serializers import SideQuestSerializer, SideQuestCreateSerializer, SideQuestCompletionSerializer
from .validators import validate_sidequest_submission, validate_sidequest_limit
from .services import approve_sidequest, decline_sidequest, submit_completion, complete_sidequest


class SideQuestListView(generics.ListAPIView):
    serializer_class   = SideQuestSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs            = SideQuest.objects.select_related("player", "game")
        status_filter = self.request.query_params.get("status")
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs


class SideQuestCreateView(generics.CreateAPIView):
    serializer_class   = SideQuestCreateSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        player_id = self.request.data.get("player")
        validate_sidequest_submission(player_id)
        serializer.save()


class SideQuestDetailView(generics.RetrieveUpdateAPIView):
    queryset = SideQuest.objects.select_related("player", "game")

    def get_serializer_class(self):
        return SideQuestSerializer

    def get_permissions(self):
        if self.request.method in ["PUT", "PATCH"]:
            return [IsAdminUser()]
        return [AllowAny()]


# ── Public: player submits completion proof ───────────────────────────────────

@api_view(["POST"])
@permission_classes([AllowAny])
def submit_completion_view(request, pk):
    try:
        quest = SideQuest.objects.get(pk=pk)
    except SideQuest.DoesNotExist:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    if quest.status != "Approved":
        return Response(
            {"detail": "Only Approved quests can have completion submitted."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    proof_image = request.FILES.get("completion_proof_image")
    notes       = request.data.get("completion_notes", "")

    submit_completion(quest, proof_image=proof_image, notes=notes)
    return Response(SideQuestSerializer(quest).data)


# ── Admin actions ─────────────────────────────────────────────────────────────

@api_view(["POST"])
@permission_classes([IsAdminUser])
def approve_sidequest_view(request, pk):
    try:
        quest = SideQuest.objects.get(pk=pk)
    except SideQuest.DoesNotExist:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    if quest.status != "Pending":
        return Response({"detail": "Only Pending quests can be approved."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        validate_sidequest_limit(quest.player_id, exclude_quest_id=quest.pk)
    except Exception as e:
        return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    approve_sidequest(quest)
    return Response(SideQuestSerializer(quest).data)


@api_view(["POST"])
@permission_classes([IsAdminUser])
def decline_sidequest_view(request, pk):
    try:
        quest = SideQuest.objects.get(pk=pk)
    except SideQuest.DoesNotExist:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
    if quest.status == "Completed":
        return Response({"detail": "Cannot decline a completed quest."}, status=status.HTTP_400_BAD_REQUEST)
    decline_sidequest(quest)
    return Response(SideQuestSerializer(quest).data)


@api_view(["POST"])
@permission_classes([IsAdminUser])
def complete_sidequest_view(request, pk):
    try:
        quest = SideQuest.objects.get(pk=pk)
    except SideQuest.DoesNotExist:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
    if quest.status != "Completion Pending":
        return Response(
            {"detail": "Quest must be in 'Completion Pending' state to mark as complete."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    complete_sidequest(quest)
    return Response(SideQuestSerializer(quest).data)
