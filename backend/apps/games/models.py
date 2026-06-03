from django.db import models
from django.core.exceptions import ValidationError


class Game(models.Model):
    name        = models.CharField(max_length=100, unique=True)
    is_active   = models.BooleanField(default=True)
    min_players = models.PositiveIntegerField(default=2)
    # null = no upper limit (infinite)
    max_players = models.PositiveIntegerField(null=True, blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name

    @property
    def player_count_label(self):
        if self.max_players is None:
            return f"{self.min_players}+"
        if self.min_players == self.max_players:
            return str(self.min_players)
        return f"{self.min_players}–{self.max_players}"

    def clean(self):
        if self.max_players is not None and self.max_players < self.min_players:
            raise ValidationError("max_players cannot be less than min_players.")
