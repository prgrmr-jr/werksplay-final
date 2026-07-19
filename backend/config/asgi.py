import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

django_asgi_app = get_asgi_application()

from apps.matches.routing import match_websocket_urlpatterns
from apps.sidequests.routing import sidequest_websocket_urlpatterns
from apps.notifications.routing import notification_websocket_urlpatterns
from apps.tournaments.routing import tournament_chat_urlpatterns

application = ProtocolTypeRouter(
    {
        "http": django_asgi_app,
        "websocket": AuthMiddlewareStack(
            URLRouter(
                notification_websocket_urlpatterns
                + match_websocket_urlpatterns
                + sidequest_websocket_urlpatterns
                + tournament_chat_urlpatterns
            )
        ),
    }
)
