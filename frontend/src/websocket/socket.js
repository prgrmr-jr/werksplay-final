const WS_BASE = import.meta.env.VITE_WS_URL || "ws://localhost:8000";

export function createSocket(path) {
  return new WebSocket(`${WS_BASE}${path}`);
}

export const WS_PATHS = {
  notifications: "/ws/notifications/",
  match:         (id) => `/ws/matches/${id}/`,
  sidequest:     (id) => `/ws/sidequests/${id}/`,
};
