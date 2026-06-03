from django.db import models
from django.contrib.auth.models import User
from apps.games.models import Game
from apps.players.models import Player


class Match(models.Model):
    STATUS_CHOICES = [
        ("Pending",  "Pending"),
        ("Approved", "Approved"),
        ("Declined", "Declined"),
    ]

    game             = models.ForeignKey(Game, on_delete=models.PROTECT, related_name="matches")
    submitted_by_name = models.CharField(max_length=150)
    status           = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Pending")
    proof_image      = models.ImageField(upload_to="matches/proofs/", null=True, blank=True)
    notes            = models.TextField(blank=True)
    submitted_at     = models.DateTimeField(auto_now_add=True)
    approved_at      = models.DateTimeField(null=True, blank=True)
    approved_by      = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name="approved_matches"
    )

    class Meta:
        ordering = ["-submitted_at"]

    def __str__(self):
        return f"Match #{self.pk} – {self.game.name} [{self.status}]"


class MatchParticipant(models.Model):
    match     = models.ForeignKey(Match, on_delete=models.CASCADE, related_name="participants")
    player    = models.ForeignKey(Player, on_delete=models.CASCADE, related_name="match_participations")
    is_winner = models.BooleanField(default=False)

    class Meta:
        unique_together = ("match", "player")

    def __str__(self):
        return f"{self.player.nickname} in Match #{self.match_id} (winner={self.is_winner})"
