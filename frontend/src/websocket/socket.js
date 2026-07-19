// const WS_BASE = import.meta.env.VITE_WS_URL || "ws://localhost:8000";

const WS_BASE =
    import.meta.env.VITE_WS_URL ||
    `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}`;

export function createSocket(path) {
  return new WebSocket(`${WS_BASE}${path}`);
}

export const WS_PATHS = {
  notifications: "/ws/notifications/",
  chats:         "/ws/chats/",
  match:         (id) => `/ws/matches/${id}/`,
  sidequest:     (id) => `/ws/sidequests/${id}/`,

};
