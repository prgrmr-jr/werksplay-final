from django.urls import re_path
from .consumers import TournamentChatConsumer

tournament_chat_urlpatterns = [
    re_path(r"^ws/tournaments/(?P<pk>\d+)/chat/$", TournamentChatConsumer.as_asgi()),
]
