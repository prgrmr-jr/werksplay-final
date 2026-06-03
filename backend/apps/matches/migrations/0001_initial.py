from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("players", "0001_initial"),
        ("games",   "0001_initial"),
        ("auth",    "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="Match",
            fields=[
                ("id",                models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("game",              models.ForeignKey("games.Game", on_delete=django.db.models.deletion.PROTECT, related_name="matches")),
                ("submitted_by_name", models.CharField(max_length=150)),
                ("status",            models.CharField(choices=[("Pending","Pending"),("Approved","Approved"),("Declined","Declined")], default="Pending", max_length=20)),
                ("proof_image",       models.ImageField(blank=True, null=True, upload_to="matches/proofs/")),
                ("notes",             models.TextField(blank=True)),
                ("submitted_at",      models.DateTimeField(auto_now_add=True)),
                ("approved_at",       models.DateTimeField(blank=True, null=True)),
                ("approved_by",       models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="approved_matches", to="auth.user")),
            ],
            options={"ordering": ["-submitted_at"]},
        ),
        migrations.CreateModel(
            name="MatchParticipant",
            fields=[
                ("id",        models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("match",     models.ForeignKey("matches.Match",   on_delete=django.db.models.deletion.CASCADE, related_name="participants")),
                ("player",    models.ForeignKey("players.Player",  on_delete=django.db.models.deletion.CASCADE, related_name="match_participations")),
                ("is_winner", models.BooleanField(default=False)),
            ],
            options={"unique_together": {("match", "player")}},
        ),
    ]
