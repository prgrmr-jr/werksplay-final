from django.urls import path
from .views import (
    TournamentListCreateView, TournamentDetailView,
    register_team_view, start_tournament_view,
    set_winner_view, swap_teams_view,
    delete_team_view, remove_member_view, add_member_view,
    messages_view,
)

urlpatterns = [
    path("",                                                              TournamentListCreateView.as_view()),
    path("<int:pk>/",                                                     TournamentDetailView.as_view()),
    path("<int:pk>/register-team/",                                       register_team_view),
    path("<int:pk>/start/",                                               start_tournament_view),
    path("<int:pk>/swap-teams/",                                          swap_teams_view),
    path("<int:pk>/messages/",                                            messages_view),
    path("<int:pk>/matches/<int:match_id>/set-winner/",                   set_winner_view),
    path("<int:pk>/teams/<int:team_id>/delete/",                          delete_team_view),
    path("<int:pk>/teams/<int:team_id>/add-member/",                      add_member_view),
    path("<int:pk>/teams/<int:team_id>/members/<int:member_id>/remove/",  remove_member_view),
]
