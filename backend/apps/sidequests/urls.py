from django.urls import path
from .views import (
    SideQuestListView, SideQuestCreateView, SideQuestDetailView,
    submit_completion_view,
    approve_sidequest_view, decline_sidequest_view, complete_sidequest_view,
)

urlpatterns = [
    path("",                              SideQuestListView.as_view()),
    path("submit/",                       SideQuestCreateView.as_view()),
    path("<int:pk>/",                     SideQuestDetailView.as_view()),
    path("<int:pk>/submit-completion/",   submit_completion_view),    # public
    path("<int:pk>/approve/",             approve_sidequest_view),    # admin
    path("<int:pk>/decline/",             decline_sidequest_view),    # admin
    path("<int:pk>/complete/",            complete_sidequest_view),   # admin
]
