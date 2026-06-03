import { createContext, useContext, useEffect, useRef, useState } from "react";
import { createSocket, WS_PATHS } from "./socket";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [lastEvent, setLastEvent] = useState(null);
  const wsRef = useRef(null);

  useEffect(() => {
    function connect() {
      const ws = createSocket(WS_PATHS.notifications);
      wsRef.current = ws;

      ws.onmessage = (e) => {
        try {
          setLastEvent(JSON.parse(e.data));
        } catch {}
      };

      ws.onclose = () => {
        // Auto-reconnect after 3 s
        setTimeout(connect, 3000);
      };
    }
    connect();
    return () => wsRef.current?.close();
  }, []);

  return (
    <NotificationContext.Provider value={{ lastEvent }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
