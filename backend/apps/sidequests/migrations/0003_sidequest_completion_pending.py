from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("sidequests", "0002_sidequest_game"),
    ]

    operations = [
        # Expand status max_length to fit "Completion Pending"
        migrations.AlterField(
            model_name="sidequest",
            name="status",
            field=models.CharField(
                choices=[
                    ("Pending",            "Pending"),
                    ("Approved",           "Approved"),
                    ("Declined",           "Declined"),
                    ("Completion Pending", "Completion Pending"),
                    ("Completed",          "Completed"),
                ],
                default="Pending",
                max_length=30,
            ),
        ),
        migrations.AddField(
            model_name="sidequest",
            name="completion_proof_image",
            field=models.ImageField(blank=True, null=True, upload_to="sidequests/completion_proofs/"),
        ),
        migrations.AddField(
            model_name="sidequest",
            name="completion_notes",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="sidequest",
            name="completion_submitted_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
