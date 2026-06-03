from rest_framework import serializers
from .models import Match, MatchParticipant
from apps.players.serializers import PlayerListSerializer
from apps.games.serializers import GameSerializer


class MatchParticipantSerializer(serializers.ModelSerializer):
    player_detail = PlayerListSerializer(source="player", read_only=True)

    class Meta:
        model  = MatchParticipant
        fields = ["id", "player", "player_detail", "is_winner"]


class MatchSerializer(serializers.ModelSerializer):
    participants = MatchParticipantSerializer(many=True, read_only=True)
    game_detail  = GameSerializer(source="game", read_only=True)

    class Meta:
        model            = Match
        fields           = "__all__"
        read_only_fields = ["submitted_at", "approved_at", "approved_by"]


class MatchCreateSerializer(serializers.ModelSerializer):
    """
    Used when submitting a new match.
    winner_ids / participant_ids are write-only; they arrive as strings from
    multipart FormData and must be handled as ints in create().
    The view passes coerced lists via _participant_ids / _winner_ids kwargs.
    """
    winner_ids      = serializers.ListField(child=serializers.IntegerField(), write_only=True, required=False)
    participant_ids = serializers.ListField(child=serializers.IntegerField(), write_only=True, required=False)

    class Meta:
        model  = Match
        fields = ["game", "submitted_by_name", "proof_image", "notes", "winner_ids", "participant_ids"]

    def create(self, validated_data):
        # Pop the list fields (may be empty if view injected via kwargs)
        winner_ids      = validated_data.pop("winner_ids",      self.context.get("_winner_ids", []))
        participant_ids = validated_data.pop("participant_ids", self.context.get("_participant_ids", []))

        # Prefer kwargs injected by perform_create (already int-coerced)
        winner_ids      = validated_data.pop("_winner_ids",      winner_ids)
        participant_ids = validated_data.pop("_participant_ids",  participant_ids)

        match = Match.objects.create(**validated_data)
        for pid in participant_ids:
            MatchParticipant.objects.create(
                match=match,
                player_id=int(pid),
                is_winner=(int(pid) in [int(w) for w in winner_ids]),
            )
        return match
