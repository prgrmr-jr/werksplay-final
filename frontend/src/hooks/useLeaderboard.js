import { useState, useEffect, useCallback } from "react";
import { getLeaderboard } from "../api/leaderboard";
import { useNotifications } from "../websocket/NotificationContext";

export function useLeaderboard() {
  const [data, setData]     = useState([]);
  const [loading, setLoading] = useState(true);
  const { lastEvent }       = useNotifications();

  const fetch = useCallback(async () => {
    try {
      const res = await getLeaderboard();
      setData(res.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  // Refresh on any leaderboard_updated WS event
  useEffect(() => {
    if (lastEvent?.event === "leaderboard_updated") fetch();
  }, [lastEvent, fetch]);

  return { data, loading, refresh: fetch };
}
