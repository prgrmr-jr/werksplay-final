from django.db import models
from apps.players.models import Player


class PointsLedger(models.Model):
    SOURCE_CHOICES = [
        ("match",     "Match"),
        ("sidequest", "SideQuest"),
    ]

    player      = models.ForeignKey(Player, on_delete=models.CASCADE, related_name="ledger_entries")
    source_type = models.CharField(max_length=20, choices=SOURCE_CHOICES)
    source_id   = models.PositiveIntegerField()
    points      = models.IntegerField()          # can be negative for revocations
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.player.nickname} | {self.source_type}#{self.source_id} | {self.points:+d}"
