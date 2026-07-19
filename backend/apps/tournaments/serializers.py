from rest_framework import serializers
from .models import Tournament, TournamentTeam, TournamentTeamMember, TournamentMatch, TournamentMessage
from apps.players.serializers import PlayerListSerializer
from apps.games.serializers import GameSerializer

MAX_PHOTO_BYTES = 5 * 1024 * 1024   # 5 MB


class TournamentTeamMemberSerializer(serializers.ModelSerializer):
    player_detail = PlayerListSerializer(source="player", read_only=True)

    class Meta:
        model  = TournamentTeamMember
        fields = ["id", "player", "player_detail"]


class TournamentTeamSerializer(serializers.ModelSerializer):
    members      = TournamentTeamMemberSerializer(many=True, read_only=True)
    member_count = serializers.SerializerMethodField()

    class Meta:
        model  = TournamentTeam
        fields = ["id", "tournament", "name", "photo", "members", "member_count", "created_at"]

    def get_member_count(self, obj):
        return obj.members.count()


class TournamentTeamCreateSerializer(serializers.ModelSerializer):
    player_ids = serializers.ListField(child=serializers.IntegerField(), write_only=True)

    class Meta:
        model  = TournamentTeam
        fields = ["name", "photo", "player_ids"]

    def validate_photo(self, value):
        if value and value.size > MAX_PHOTO_BYTES:
            mb = value.size / (1024 * 1024)
            raise serializers.ValidationError(
                f"Photo is too large ({mb:.1f} MB). Maximum allowed is 5 MB."
            )
        return value

    def validate(self, data):
        tournament = self.context["tournament"]
        player_ids = data["player_ids"]

        if len(player_ids) < 1:
            raise serializers.ValidationError("A team must have at least 1 player.")

        if len(player_ids) > tournament.team_size:
            raise serializers.ValidationError(
                f"Maximum {tournament.team_size} players per team. You selected {len(player_ids)}."
            )

        if len(player_ids) != len(set(player_ids)):
            raise serializers.ValidationError("Duplicate players are not allowed.")

        existing = TournamentTeamMember.objects.filter(
            team__tournament=tournament,
            player_id__in=player_ids,
        ).select_related("player", "team")

        if existing.exists():
            conflicts = [f"{m.player.nickname} (already in '{m.team.name}')" for m in existing]
            raise serializers.ValidationError(
                f"The following players are already in a team: {', '.join(conflicts)}"
            )

        return data

    def create(self, validated_data):
        player_ids = validated_data.pop("player_ids")
        team       = TournamentTeam.objects.create(**validated_data)
        for pid in player_ids:
            TournamentTeamMember.objects.create(team=team, player_id=pid)
        return team


class TournamentMatchSerializer(serializers.ModelSerializer):
    team_a_detail = TournamentTeamSerializer(source="team_a", read_only=True)
    team_b_detail = TournamentTeamSerializer(source="team_b", read_only=True)
    winner_detail = TournamentTeamSerializer(source="winner", read_only=True)

    class Meta:
        model  = TournamentMatch
        fields = [
            "id", "round_number", "match_number",
            "team_a", "team_a_detail",
            "team_b", "team_b_detail",
            "winner", "winner_detail",
            "is_bye", "status",
        ]


class TournamentMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model  = TournamentMessage
        fields = ["id", "author_name", "is_admin", "message", "created_at"]
        read_only_fields = ["created_at", "is_admin"]


class TournamentSerializer(serializers.ModelSerializer):
    game_detail = GameSerializer(source="game", read_only=True)
    team_count  = serializers.SerializerMethodField()

    class Meta:
        model  = Tournament
        fields = [
            "id", "name", "game", "game_detail",
            "team_size", "status",
            "scheduled_at", "registration_deadline",
            "team_count", "created_at", "started_at",
        ]

    def get_team_count(self, obj):
        return obj.teams.count()


class TournamentDetailSerializer(TournamentSerializer):
    teams   = TournamentTeamSerializer(many=True, read_only=True)
    matches = TournamentMatchSerializer(many=True, read_only=True)

    class Meta(TournamentSerializer.Meta):
        fields = TournamentSerializer.Meta.fields + ["teams", "matches"]
