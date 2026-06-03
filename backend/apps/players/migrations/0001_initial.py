from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Player",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("fullname",   models.CharField(max_length=150)),
                ("nickname",   models.CharField(max_length=80, unique=True)),
                ("department", models.CharField(blank=True, max_length=120)),
                ("photo",      models.ImageField(blank=True, null=True, upload_to="players/photos/")),
                ("bio",        models.TextField(blank=True)),
                ("is_active",  models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={"ordering": ["fullname"]},
        ),
    ]
