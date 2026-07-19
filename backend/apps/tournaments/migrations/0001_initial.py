from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("games",   "0002_game_player_counts"),
        ("players", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="Tournament",
            fields=[
                ("id",         models.BigAutoField(auto_created=True, primary_key=True, serialize=False)),
                ("name",       models.CharField(max_length=150)),
                ("game",       models.ForeignKey("games.Game", on_delete=django.db.models.deletion.PROTECT, related_name="tournaments")),
                ("team_size",  models.PositiveIntegerField(default=2)),
                ("status",     models.CharField(choices=[("Registration","Registration"),("In Progress","In Progress"),("Completed","Completed")], default="Registration", max_length=20)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("started_at", models.DateTimeField(blank=True, null=True)),
            ],
            options={"ordering": ["-created_at"]},
        ),
        migrations.CreateModel(
            name="TournamentTeam",
            fields=[
                ("id",          models.BigAutoField(auto_created=True, primary_key=True, serialize=False)),
                ("tournament",  models.ForeignKey("tournaments.Tournament", on_delete=django.db.models.deletion.CASCADE, related_name="teams")),
                ("name",        models.CharField(max_length=100)),
                ("created_at",  models.DateTimeField(auto_now_add=True)),
            ],
            options={"ordering": ["created_at"], "unique_together": {("tournament", "name")}},
        ),
        migrations.CreateModel(
            name="TournamentTeamMember",
            fields=[
                ("id",     models.BigAutoField(auto_created=True, primary_key=True, serialize=False)),
                ("team",   models.ForeignKey("tournaments.TournamentTeam", on_delete=django.db.models.deletion.CASCADE, related_name="members")),
                ("player", models.ForeignKey("players.Player", on_delete=django.db.models.deletion.CASCADE, related_name="tournament_memberships")),
            ],
            options={"unique_together": {("team", "player")}},
        ),
        migrations.CreateModel(
            name="TournamentMatch",
            fields=[
                ("id",           models.BigAutoField(auto_created=True, primary_key=True, serialize=False)),
                ("tournament",   models.ForeignKey("tournaments.Tournament", on_delete=django.db.models.deletion.CASCADE, related_name="matches")),
                ("round_number", models.PositiveIntegerField()),
                ("match_number", models.PositiveIntegerField()),
                ("team_a",       models.ForeignKey("tournaments.TournamentTeam", on_delete=django.db.models.deletion.SET_NULL, null=True, blank=True, related_name="matches_as_a")),
                ("team_b",       models.ForeignKey("tournaments.TournamentTeam", on_delete=django.db.models.deletion.SET_NULL, null=True, blank=True, related_name="matches_as_b")),
                ("winner",       models.ForeignKey("tournaments.TournamentTeam", on_delete=django.db.models.deletion.SET_NULL, null=True, blank=True, related_name="won_matches")),
                ("is_bye",       models.BooleanField(default=False)),
                ("status",       models.CharField(choices=[("Pending","Pending"),("Completed","Completed")], default="Pending", max_length=20)),
            ],
            options={"ordering": ["round_number", "match_number"], "unique_together": {("tournament", "round_number", "match_number")}},
        ),
    ]
