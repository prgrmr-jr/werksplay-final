import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async


class TournamentChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.tournament_id = self.scope["url_route"]["kwargs"]["pk"]
        self.group_name    = f"tournament_chat_{self.tournament_id}"
        # Detect if the connected user is an authenticated admin
        self.is_admin = (
            self.scope.get("user") is not None
            and self.scope["user"].is_authenticated
            and self.scope["user"].is_staff
        )
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

        # Send last 50 messages as history
        history = await self.get_history()
        await self.send(text_data=json.dumps({"type": "history", "messages": history}))

    async def disconnect(self, code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        try:
            data    = json.loads(text_data)
            message = (data.get("message") or "").strip()
            if not message:
                return

            # Admin: force author_name to "Admin"
            # Anonymous: use whatever name they provide (trimmed, max 50 chars)
            if self.is_admin:
                author_name = "Admin"
                is_admin    = True
            else:
                author_name = (data.get("author_name") or "Anonymous").strip()[:50]
                is_admin    = False

            saved = await self.save_message(author_name, is_admin, message)
            await self.channel_layer.group_send(
                self.group_name,
                {
                    "type":        "chat_message",
                    "id":          saved["id"],
                    "author_name": saved["author_name"],
                    "is_admin":    saved["is_admin"],
                    "message":     saved["message"],
                    "created_at":  saved["created_at"],
                }
            )
        except Exception:
            pass

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            "type":        "message",
            "id":          event["id"],
            "author_name": event["author_name"],
            "is_admin":    event["is_admin"],
            "message":     event["message"],
            "created_at":  event["created_at"],
        }))

    @database_sync_to_async
    def save_message(self, author_name, is_admin, message):
        from .models import TournamentMessage
        msg = TournamentMessage.objects.create(
            tournament_id=self.tournament_id,
            author_name=author_name,
            is_admin=is_admin,
            message=message,
        )
        return {
            "id":          msg.pk,
            "author_name": msg.author_name,
            "is_admin":    msg.is_admin,
            "message":     msg.message,
            "created_at":  msg.created_at.isoformat(),
        }

    @database_sync_to_async
    def get_history(self):
        from .models import TournamentMessage
        msgs = TournamentMessage.objects.filter(
            tournament_id=self.tournament_id
        ).order_by("-created_at")[:50]
        return [
            {
                "id":          m.pk,
                "author_name": m.author_name,
                "is_admin":    m.is_admin,
                "message":     m.message,
                "created_at":  m.created_at.isoformat(),
            }
            for m in reversed(list(msgs))
        ]
