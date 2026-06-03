from django.urls import re_path
from .consumers import SideQuestConsumer

sidequest_websocket_urlpatterns = [
    re_path(r"^ws/sidequests/(?P<quest_id>\d+)/$", SideQuestConsumer.as_asgi()),
]
