from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("django-admin/", admin.site.urls),

    # API routes
    path("api/players/",     include("apps.players.urls")),
    path("api/games/",       include("apps.games.urls")),
    path("api/matches/",     include("apps.matches.urls")),
    path("api/sidequests/",  include("apps.sidequests.urls")),
    path("api/leaderboard/", include("apps.leaderboard.urls")),
    path("api/comments/",    include("apps.comments.urls")),
    path("api/accounts/",    include("apps.accounts.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
