from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("tournaments", "0003_tournamentteam_photo"),
    ]

    operations = [
        # scheduled_at + registration_deadline on Tournament
        migrations.AddField(
            model_name="tournament",
            name="scheduled_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="tournament",
            name="registration_deadline",
            field=models.DateTimeField(blank=True, null=True),
        ),
        # TournamentMessage — anonymous chat
        migrations.CreateModel(
            name="TournamentMessage",
            fields=[
                ("id",          models.BigAutoField(auto_created=True, primary_key=True, serialize=False)),
                ("tournament",  models.ForeignKey("tournaments.Tournament", on_delete=django.db.models.deletion.CASCADE, related_name="messages")),
                ("author_name", models.CharField(max_length=100)),
                ("is_admin",    models.BooleanField(default=False)),
                ("message",     models.TextField()),
                ("created_at",  models.DateTimeField(auto_now_add=True)),
            ],
            options={"ordering": ["created_at"]},
        ),
    ]
