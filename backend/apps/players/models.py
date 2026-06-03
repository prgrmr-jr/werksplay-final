from django.db import models


class Player(models.Model):
    fullname   = models.CharField(max_length=150)
    nickname   = models.CharField(max_length=80, unique=True)
    department = models.CharField(max_length=120, blank=True)
    photo      = models.ImageField(upload_to="players/photos/", null=True, blank=True)
    bio        = models.TextField(blank=True)
    is_active  = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["fullname"]

    def __str__(self):
        return f"{self.nickname} ({self.fullname})"
