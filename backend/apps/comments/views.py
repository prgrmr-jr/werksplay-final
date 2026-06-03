from rest_framework import generics, serializers as drf_serializers
from rest_framework.permissions import AllowAny
from django.contrib.contenttypes.models import ContentType
from .models import Comment
from .serializers import CommentSerializer


# Map safe model-name strings → actual model classes
_MODEL_MAP = {
    "match":     "matches.match",
    "sidequest": "sidequests.sidequest",
}


class CommentListCreateView(generics.ListCreateAPIView):
    serializer_class   = CommentSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        model_name = self.request.query_params.get("model", "").lower()
        object_id  = self.request.query_params.get("object_id")
        qs         = Comment.objects.all()
        if model_name and object_id:
            app_model = _MODEL_MAP.get(model_name)
            if not app_model:
                return Comment.objects.none()
            try:
                app_label, model = app_model.split(".")
                ct = ContentType.objects.get(app_label=app_label, model=model)
                qs = qs.filter(content_type=ct, object_id=object_id)
            except ContentType.DoesNotExist:
                return Comment.objects.none()
        return qs

    def perform_create(self, serializer):
        """
        Resolve content_type from the `content_type_name` field in the request
        so the client never has to know internal CT ids.
        """
        model_name = self.request.data.get("content_type_name", "").lower()
        object_id  = self.request.data.get("object_id")

        app_model = _MODEL_MAP.get(model_name)
        if not app_model:
            raise drf_serializers.ValidationError(
                {"content_type_name": f"Unknown model '{model_name}'. Use 'match' or 'sidequest'."}
            )

        app_label, model = app_model.split(".")
        try:
            ct = ContentType.objects.get(app_label=app_label, model=model)
        except ContentType.DoesNotExist:
            raise drf_serializers.ValidationError({"content_type_name": "Content type not found."})

        serializer.save(content_type=ct, object_id=object_id)
