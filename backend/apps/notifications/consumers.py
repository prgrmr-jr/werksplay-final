import json
from channels.generic.websocket import AsyncWebsocketConsumer


class NotificationConsumer(AsyncWebsocketConsumer):
    """
    Global broadcast channel.
    Every connected client joins the "notifications" group and receives
    real-time events: leaderboard_updated, match_approved, sidequest_completed, etc.
    """

    GROUP_NAME = "notifications"

    async def connect(self):
        await self.channel_layer.group_add(self.GROUP_NAME, self.channel_name)
        await self.accept()

    async def disconnect(self, code):
        await self.channel_layer.group_discard(self.GROUP_NAME, self.channel_name)

    # Called by group_send with type="notify"
    async def notify(self, event):
        await self.send(text_data=json.dumps(event))
