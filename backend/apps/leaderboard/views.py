from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .services import get_leaderboard


@api_view(["GET"])
@permission_classes([AllowAny])
def leaderboard_view(request):
    limit = int(request.query_params.get("limit", 50))
    data  = get_leaderboard(limit=limit)
    return Response(data)
