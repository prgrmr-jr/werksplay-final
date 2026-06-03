from django.contrib.auth import authenticate, login, logout
from django.middleware.csrf import get_token
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response


@api_view(["GET"])
@permission_classes([AllowAny])
def csrf_view(request):
    """
    Call once on app load so Django sets the csrftoken cookie.
    The axios interceptor then reads this cookie and sends it as
    X-CSRFToken on every POST / PATCH / DELETE.
    """
    return Response({"csrfToken": get_token(request)})


@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get("username")
    password = request.data.get("password")
    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        return Response({"detail": "Logged in.", "is_staff": user.is_staff})
    return Response({"detail": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_view(request):
    logout(request)
    return Response({"detail": "Logged out."})


@api_view(["GET"])
def me_view(request):
    if request.user.is_authenticated:
        return Response({"username": request.user.username, "is_staff": request.user.is_staff})
    return Response({"detail": "Not authenticated."}, status=status.HTTP_401_UNAUTHORIZED)
