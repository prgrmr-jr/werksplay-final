from rest_framework import serializers
from django.contrib.contenttypes.models import ContentType
from .models import Comment


class CommentSerializer(serializers.ModelSerializer):
    content_type_name = serializers.SerializerMethodField()

    # Write-only field — client sends "match" or "sidequest"; view resolves CT
    content_type_name_input = serializers.CharField(write_only=True, required=False, source="content_type_name")

    class Meta:
        model  = Comment
        fields = [
            "id",
            "content_type",          # read: shows resolved CT id
            "content_type_name",     # read: human-readable model name
            "content_type_name_input",  # write: what client sends
            "object_id",
            "author_name",
            "message",
            "created_at",
        ]
        read_only_fields  = ["created_at", "content_type", "content_type_name"]
        # content_type & object_id are set by the view, not validated here
        extra_kwargs = {
            "content_type": {"required": False},
            "object_id":    {"required": False},
        }

    def get_content_type_name(self, obj):
        return obj.content_type.model if obj.content_type_id else None
