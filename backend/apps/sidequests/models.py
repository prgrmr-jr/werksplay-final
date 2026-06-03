from django.db import models
from apps.players.models import Player
from apps.games.models import Game


class SideQuest(models.Model):
    STATUS_CHOICES = [
        ("Pending",            "Pending"),
        ("Approved",           "Approved"),
        ("Declined",           "Declined"),
        ("Completion Pending", "Completion Pending"),
        ("Completed",          "Completed"),
    ]

    player        = models.ForeignKey(Player, on_delete=models.CASCADE, related_name="side_quests")
    game          = models.ForeignKey(Game, on_delete=models.SET_NULL, null=True, blank=True, related_name="side_quests")
    current_rank  = models.CharField(max_length=100, blank=True)
    highest_rank  = models.CharField(max_length=100, blank=True)
    goal          = models.TextField()
    proof_image   = models.ImageField(upload_to="sidequests/proofs/", null=True, blank=True)
    notes         = models.TextField(blank=True)
    status        = models.CharField(max_length=30, choices=STATUS_CHOICES, default="Pending")
    points        = models.PositiveIntegerField(default=20)

    # Completion proof — uploaded by the player/public when submitting for completion
    completion_proof_image = models.ImageField(upload_to="sidequests/completion_proofs/", null=True, blank=True)
    completion_notes       = models.TextField(blank=True)
    completion_submitted_at = models.DateTimeField(null=True, blank=True)

    submitted_at  = models.DateTimeField(auto_now_add=True)
    approved_at   = models.DateTimeField(null=True, blank=True)
    completed_at  = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-submitted_at"]

    def __str__(self):
        game_name = self.game.name if self.game else "No Game"
        return f"SideQuest #{self.pk} – {self.player.nickname} [{game_name}] [{self.status}]"
