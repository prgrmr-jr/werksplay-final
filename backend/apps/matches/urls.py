from django.urls import path
from .views import MatchListView, MatchCreateView, MatchDetailView, approve_match_view, decline_match_view

urlpatterns = [
    path("",                      MatchListView.as_view()),
    path("submit/",               MatchCreateView.as_view()),
    path("<int:pk>/",             MatchDetailView.as_view()),
    path("<int:pk>/approve/",     approve_match_view),
    path("<int:pk>/decline/",     decline_match_view),
]
