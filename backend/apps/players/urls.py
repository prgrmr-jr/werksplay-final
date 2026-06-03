from django.urls import path
from .views import PlayerListCreateView, PlayerAdminListView, PlayerRetrieveUpdateView, player_profile_view

urlpatterns = [
    path("",               PlayerListCreateView.as_view()),   # public active list + create
    path("all/",           PlayerAdminListView.as_view()),    # admin: all players
    path("<int:pk>/",      PlayerRetrieveUpdateView.as_view()),
    path("<int:pk>/profile/", player_profile_view),
]
