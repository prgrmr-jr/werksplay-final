from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("games", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="game",
            name="min_players",
            field=models.PositiveIntegerField(default=2),
        ),
        migrations.AddField(
            model_name="game",
            name="max_players",
            field=models.PositiveIntegerField(null=True, blank=True),
        ),
    ]
