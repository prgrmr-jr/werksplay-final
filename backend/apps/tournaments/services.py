import math
import random
from django.utils import timezone
from rest_framework.exceptions import ValidationError
from .models import Tournament, TournamentTeam, TournamentMatch


def generate_bracket(tournament: Tournament):
    """
    Shuffle all registered teams randomly and build a single-elimination bracket.
    Called once when admin presses "Start Tournament".
    Creates placeholder TournamentMatch rows for ALL rounds up front.
    Teams with byes auto-advance and their Round-1 match is marked Completed.
    """
    if tournament.status != "Registration":
        raise ValidationError("Bracket can only be generated during Registration phase.")

    teams = list(tournament.teams.all())
    if len(teams) < 2:
        raise ValidationError("At least 2 teams are required to start a tournament.")

    # Delete any previously generated matches (re-generation)
    tournament.matches.all().delete()

    random.shuffle(teams)

    # Pad to next power of 2 with None = bye slot
    n_slots = 2 ** math.ceil(math.log2(len(teams)))
    padded  = teams + [None] * (n_slots - len(teams))

    total_rounds = int(math.log2(n_slots))

    # ── Round 1 ──────────────────────────────────────────────
    match_number = 1
    for i in range(0, n_slots, 2):
        ta = padded[i]
        tb = padded[i + 1]
        is_bye = (ta is not None and tb is None) or (ta is None and tb is not None)
        winner = ta if tb is None else (tb if ta is None else None)
        status = "Completed" if is_bye else "Pending"
        TournamentMatch.objects.create(
            tournament   = tournament,
            round_number = 1,
            match_number = match_number,
            team_a       = ta,
            team_b       = tb,
            winner       = winner,
            is_bye       = is_bye,
            status       = status,
        )
        match_number += 1

    # ── Placeholder matches for rounds 2..N ──────────────────
    matches_in_round = n_slots // 2
    for rnd in range(2, total_rounds + 1):
        matches_in_round = matches_in_round // 2
        for m in range(1, matches_in_round + 1):
            TournamentMatch.objects.create(
                tournament   = tournament,
                round_number = rnd,
                match_number = m,
            )

    # ── Propagate bye winners into Round 2 ───────────────────
    _propagate_winners(tournament, from_round=1)

    tournament.status     = "In Progress"
    tournament.started_at = timezone.now()
    tournament.save()


def set_winner(match: TournamentMatch, winning_team: TournamentTeam):
    """Admin declares the winner of a match. Auto-advances winner to next round."""
    if match.status == "Completed":
        raise ValidationError("This match is already completed.")
    if winning_team not in [match.team_a, match.team_b]:
        raise ValidationError("Winner must be one of the two competing teams.")

    match.winner = winning_team
    match.status = "Completed"
    match.save()

    _propagate_winners(match.tournament, from_round=match.round_number)

    # Check if tournament is now complete (final match done)
    total_rounds = _total_rounds(match.tournament)
    final = TournamentMatch.objects.filter(
        tournament=match.tournament,
        round_number=total_rounds,
    ).first()
    if final and final.status == "Completed":
        match.tournament.status = "Completed"
        match.tournament.save()


def swap_teams(tournament: Tournament, match_id_1: int, slot_1: str,
               match_id_2: int, slot_2: str):
    """
    Swap two team slots in Round 1 (admin bracket editor).
    slot must be 'a' or 'b'.
    Only allowed before the tournament is locked (still In Progress but no match completed yet).
    """
    m1 = TournamentMatch.objects.get(pk=match_id_1, tournament=tournament, round_number=1)
    m2 = TournamentMatch.objects.get(pk=match_id_2, tournament=tournament, round_number=1)

    def _get(m, slot):
        return m.team_a if slot == "a" else m.team_b

    def _set(m, slot, val):
        if slot == "a":
            m.team_a = val
        else:
            m.team_b = val

    t1 = _get(m1, slot_1)
    t2 = _get(m2, slot_2)
    _set(m1, slot_1, t2)
    _set(m2, slot_2, t1)
    m1.save()
    m2.save()


# ── Helpers ───────────────────────────────────────────────────────────────────

def _total_rounds(tournament: Tournament) -> int:
    return tournament.matches.aggregate(
        max_round=__import__("django.db.models", fromlist=["Max"]).Max("round_number")
    )["max_round"] or 1


def _propagate_winners(tournament: Tournament, from_round: int):
    """
    After completing matches in `from_round`, fill in the team slots
    of the corresponding matches in `from_round + 1`.
    """
    completed = TournamentMatch.objects.filter(
        tournament=tournament,
        round_number=from_round,
        status="Completed",
    ).order_by("match_number")

    for match in completed:
        if not match.winner:
            continue
        next_round  = from_round + 1
        # match_number 1,2 → feeds next match 1; 3,4 → feeds next match 2
        next_match_number = math.ceil(match.match_number / 2)
        slot = "a" if match.match_number % 2 == 1 else "b"
        try:
            next_match = TournamentMatch.objects.get(
                tournament=tournament,
                round_number=next_round,
                match_number=next_match_number,
            )
            if slot == "a":
                next_match.team_a = match.winner
            else:
                next_match.team_b = match.winner
            next_match.save()
        except TournamentMatch.DoesNotExist:
            pass
