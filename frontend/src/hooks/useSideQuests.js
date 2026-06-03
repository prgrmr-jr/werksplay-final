import { useState, useEffect, useCallback } from "react";
import { getSideQuests } from "../api/sidequests";
import { useNotifications } from "../websocket/NotificationContext";

export function useSideQuests(statusFilter = "") {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const { lastEvent }         = useNotifications();

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getSideQuests(statusFilter || undefined);
      setData(res.data.results ?? res.data);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetch(); }, [fetch]);

  useEffect(() => {
    if (["sidequest_approved", "sidequest_declined", "sidequest_completed", "sidequest_completion_pending"].includes(lastEvent?.event)) fetch();
  }, [lastEvent, fetch]);

  return { data, loading, refresh: fetch };
}
