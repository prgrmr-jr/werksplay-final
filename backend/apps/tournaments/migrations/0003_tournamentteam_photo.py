from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("tournaments", "0002_alter_tournament_id_alter_tournamentmatch_id_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="tournamentteam",
            name="photo",
            field=models.ImageField(blank=True, null=True, upload_to="tournaments/teams/"),
        ),
    ]
