from django.urls import path
from .views import GameListCreateView, GameRetrieveUpdateView

urlpatterns = [
    path("",          GameListCreateView.as_view()),
    path("<int:pk>/", GameRetrieveUpdateView.as_view()),
]
