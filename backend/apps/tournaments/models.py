from django.db import models
from apps.games.models import Game
from apps.players.models import Player


# class Tournament(models.Model):
#     STATUS_CHOICES = [
#         ("Registration", "Registration"),
#         ("In Progress",  "In Progress"),
#         ("Completed",    "Completed"),
#     ]
#
#     name                  = models.CharField(max_length=150)
#     game                  = models.ForeignKey(Game, on_delete=models.PROTECT, related_name="tournaments")
#     team_size             = models.PositiveIntegerField(default=2)
#     status                = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Registration")
#     scheduled_at          = models.DateTimeField(null=True, blank=True)
#     registration_deadline = models.DateTimeField(null=True, blank=True)
#     created_at            = models.DateTimeField(auto_now_add=True)
#     started_at            = models.DateTimeField(null=True, blank=True)
#
#     class Meta:
#         ordering = ["-created_at"]
#
#     def __str__(self):
#         return f"{self.name} [{self.status}]"
class Tournament(models.Model):
    STATUS_CHOICES = [
        ("Registration", "Registration"),
        ("In Progress", "In Progress"),
        ("Completed", "Completed"),
    ]

    name = models.CharField(max_length=150)
    game = models.ForeignKey(
        Game,
        on_delete=models.PROTECT,
        related_name="tournaments",
    )
    team_size = models.PositiveIntegerField(default=2)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="Registration",
    )
    scheduled_at = models.DateTimeField(null=True, blank=True)
    registration_deadline = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["name", "game"],
                name="unique_tournament_name_per_game",
            )
        ]

    def __str__(self):
        return f"{self.name} [{self.status}]"


class TournamentTeam(models.Model):
    tournament = models.ForeignKey(
        Tournament,
        on_delete=models.CASCADE,
        related_name="teams",
    )
    name = models.CharField(max_length=100)
    photo = models.ImageField(
        upload_to="tournaments/teams/",
        null=True,
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["tournament", "name"],
                name="unique_team_name_per_tournament",
            )
        ]

    def __str__(self):
        return f"{self.name} @ {self.tournament.name}"


class TournamentTeamMember(models.Model):
    team   = models.ForeignKey(TournamentTeam, on_delete=models.CASCADE, related_name="members")
    player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name="tournament_memberships")

    class Meta:
        unique_together = ("team", "player")

    def __str__(self):
        return f"{self.player.nickname} → {self.team.name}"


class TournamentMatch(models.Model):
    STATUS_CHOICES = [
        ("Pending",   "Pending"),
        ("Completed", "Completed"),
    ]

    tournament   = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name="matches")
    round_number = models.PositiveIntegerField()
    match_number = models.PositiveIntegerField()
    team_a       = models.ForeignKey(TournamentTeam, on_delete=models.SET_NULL, null=True, blank=True, related_name="matches_as_a")
    team_b       = models.ForeignKey(TournamentTeam, on_delete=models.SET_NULL, null=True, blank=True, related_name="matches_as_b")
    winner       = models.ForeignKey(TournamentTeam, on_delete=models.SET_NULL, null=True, blank=True, related_name="won_matches")
    is_bye       = models.BooleanField(default=False)
    status       = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Pending")

    class Meta:
        ordering        = ["round_number", "match_number"]
        unique_together = ("tournament", "round_number", "match_number")

    def __str__(self):
        return f"{self.tournament.name} R{self.round_number} M{self.match_number}"


class TournamentMessage(models.Model):
    """Chat messages for a tournament. Anonymous — just a name string."""
    tournament  = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name="messages")
    author_name = models.CharField(max_length=100)
    is_admin    = models.BooleanField(default=False)
    message     = models.TextField()
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        role = "Admin" if self.is_admin else self.author_name
        return f"{role} @ {self.tournament.name}: {self.message[:40]}"
