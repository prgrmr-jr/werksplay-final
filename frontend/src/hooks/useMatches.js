import { useState, useEffect, useCallback } from "react";
import { getMatches } from "../api/matches";
import { useNotifications } from "../websocket/NotificationContext";

export function useMatches(statusFilter = "") {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const { lastEvent }         = useNotifications();

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMatches(statusFilter || undefined);
      setData(res.data.results ?? res.data);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetch(); }, [fetch]);

  useEffect(() => {
    if (["match_approved", "match_declined"].includes(lastEvent?.event)) fetch();
  }, [lastEvent, fetch]);

  return { data, loading, refresh: fetch };
}
