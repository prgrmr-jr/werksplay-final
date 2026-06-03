from django.urls import re_path
from .consumers import MatchConsumer

match_websocket_urlpatterns = [
    re_path(r"^ws/matches/(?P<match_id>\d+)/$", MatchConsumer.as_asgi()),
]
