from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("players", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="PointsLedger",
            fields=[
                ("id",          models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("player",      models.ForeignKey("players.Player", on_delete=django.db.models.deletion.CASCADE, related_name="ledger_entries")),
                ("source_type", models.CharField(choices=[("match","Match"),("sidequest","SideQuest")], max_length=20)),
                ("source_id",   models.PositiveIntegerField()),
                ("points",      models.IntegerField()),
                ("created_at",  models.DateTimeField(auto_now_add=True)),
            ],
            options={"ordering": ["-created_at"]},
        ),
    ]
