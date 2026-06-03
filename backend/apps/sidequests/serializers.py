from rest_framework import serializers
from .models import SideQuest
from apps.players.serializers import PlayerListSerializer
from apps.games.serializers import GameSerializer


class SideQuestSerializer(serializers.ModelSerializer):
    player_detail = PlayerListSerializer(source="player", read_only=True)
    game_detail   = GameSerializer(source="game", read_only=True)

    class Meta:
        model            = SideQuest
        fields           = "__all__"
        read_only_fields = ["submitted_at", "approved_at", "completed_at",
                            "completion_submitted_at", "status"]


class SideQuestCreateSerializer(serializers.ModelSerializer):
    """Strict serializer for public submissions — status and points fully locked."""
    class Meta:
        model  = SideQuest
        fields = [
            "player", "game",
            "goal", "current_rank", "highest_rank",
            "proof_image", "notes",
        ]


class SideQuestCompletionSerializer(serializers.ModelSerializer):
    """Used when a player submits completion proof publicly."""
    class Meta:
        model  = SideQuest
        fields = ["completion_proof_image", "completion_notes"]
