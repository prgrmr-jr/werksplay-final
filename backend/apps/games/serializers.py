from rest_framework import serializers
from .models import Game


class GameSerializer(serializers.ModelSerializer):
    player_count_label = serializers.ReadOnlyField()

    class Meta:
        model  = Game
        fields = [
            "id", "name", "is_active",
            "min_players", "max_players", "player_count_label",
            "created_at",
        ]

    def validate(self, data):
        mn = data.get("min_players", 2)
        mx = data.get("max_players", None)
        if mx is not None and mx < mn:
            raise serializers.ValidationError(
                {"max_players": "max_players cannot be less than min_players."}
            )
        return data
