import json
from channels.generic.websocket import AsyncWebsocketConsumer


class SideQuestConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.quest_id   = self.scope["url_route"]["kwargs"]["quest_id"]
        self.group_name = f"sidequest_{self.quest_id}"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def sidequest_update(self, event):
        await self.send(text_data=json.dumps(event))
