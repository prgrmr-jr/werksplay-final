from django.core.management.base import BaseCommand
from apps.games.models import Game


class Command(BaseCommand):
    help = "Seed the database with initial games data"

    def handle(self, *args, **options):
        games_data = [
            {"name": "Chess", "min_players": 2, "max_players": 2},
            {"name": "Mahjong", "min_players": 4, "max_players": 4},
            {"name": "Checkers", "min_players": 2, "max_players": 2},
            {"name": "Tong-Its", "min_players": 3, "max_players": 3},
            {"name": "Codenames", "min_players": 2, "max_players": 10},
            {"name": "Poetry for Neanderthals", "min_players": 2, "max_players": 20},
            {"name": "Taboo", "min_players": 4, "max_players": 12},
            {"name": "Mario Kart 8 Deluxe", "min_players": 2, "max_players": 12},
            {"name": "Dota 2", "min_players": 10, "max_players": 10},
            {"name": "Mobile Legends", "min_players": 10, "max_players": 10},
            {"name": "Valorant", "min_players": 10, "max_players": 10},
            {"name": "Call of Duty (Free For All)", "min_players": 5, "max_players": 50},
            {"name": "Pokemon Unite", "min_players": 10, "max_players": 10},
        ]

        for game_data in games_data:
            game, created = Game.objects.get_or_create(
                name=game_data["name"],
                defaults={
                    "min_players": game_data["min_players"],
                    "max_players": game_data["max_players"],
                },
            )
            status = "Created" if created else "Already exists"
            self.stdout.write(
                self.style.SUCCESS(f"{status}: {game.name}")
            )
