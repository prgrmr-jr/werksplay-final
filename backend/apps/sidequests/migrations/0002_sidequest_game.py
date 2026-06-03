from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("sidequests", "0001_initial"),
        ("games",      "0002_game_player_counts"),
    ]

    operations = [
        migrations.AddField(
            model_name="sidequest",
            name="game",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="side_quests",
                to="games.game",
            ),
        ),
    ]
