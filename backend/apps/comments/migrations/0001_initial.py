from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("contenttypes", "0002_remove_content_type_name"),
    ]

    operations = [
        migrations.CreateModel(
            name="Comment",
            fields=[
                ("id",           models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("content_type", models.ForeignKey("contenttypes.ContentType", on_delete=django.db.models.deletion.CASCADE)),
                ("object_id",    models.PositiveIntegerField()),
                ("author_name",  models.CharField(max_length=150)),
                ("message",      models.TextField()),
                ("created_at",   models.DateTimeField(auto_now_add=True)),
            ],
            options={"ordering": ["created_at"]},
        ),
    ]
