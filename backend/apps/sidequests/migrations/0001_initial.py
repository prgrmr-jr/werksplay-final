from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("players", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="SideQuest",
            fields=[
                ("id",           models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("player",       models.ForeignKey("players.Player", on_delete=django.db.models.deletion.CASCADE, related_name="side_quests")),
                ("current_rank", models.CharField(blank=True, max_length=100)),
                ("highest_rank", models.CharField(blank=True, max_length=100)),
                ("goal",         models.TextField()),
                ("proof_image",  models.ImageField(blank=True, null=True, upload_to="sidequests/proofs/")),
                ("notes",        models.TextField(blank=True)),
                ("status",       models.CharField(choices=[("Pending","Pending"),("Approved","Approved"),("Declined","Declined"),("Completed","Completed")], default="Pending", max_length=20)),
                ("points",       models.PositiveIntegerField(default=50)),
                ("submitted_at", models.DateTimeField(auto_now_add=True)),
                ("approved_at",  models.DateTimeField(blank=True, null=True)),
                ("completed_at", models.DateTimeField(blank=True, null=True)),
            ],
            options={"ordering": ["-submitted_at"]},
        ),
    ]
