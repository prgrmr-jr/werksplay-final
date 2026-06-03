from rest_framework import generics
from rest_framework.permissions import IsAdminUser, AllowAny
from .models import Game
from .serializers import GameSerializer


class GameListCreateView(generics.ListCreateAPIView):
    serializer_class = GameSerializer

    def get_queryset(self):
        return Game.objects.filter(is_active=True)

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAdminUser()]
        return [AllowAny()]

    def perform_create(self, serializer):
        # Force is_active=True — multipart FormData omits unchecked booleans
        serializer.save(is_active=True)


class GameRetrieveUpdateView(generics.RetrieveUpdateAPIView):
    queryset         = Game.objects.all()
    serializer_class = GameSerializer

    def get_permissions(self):
        if self.request.method in ["PUT", "PATCH"]:
            return [IsAdminUser()]
        return [AllowAny()]
