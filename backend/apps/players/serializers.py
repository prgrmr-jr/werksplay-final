from rest_framework import serializers
from .models import Player


class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = "__all__"


class PlayerListSerializer(serializers.ModelSerializer):
    """Lighter serializer for list/leaderboard views."""
    class Meta:
        model = Player
        fields = ["id", "fullname", "nickname", "department", "photo", "is_active"]
