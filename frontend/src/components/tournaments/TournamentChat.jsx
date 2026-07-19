import { useState, useEffect, useRef } from "react";
import { ChatBubbleLeftRightIcon, PaperAirplaneIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../../auth/AuthContext";

const WS_BASE = import.meta.env.VITE_WS_URL || "ws://localhost:8000";

function formatTime(iso) {
  return new Date(iso).toLocaleString("en-PH", {
    timeZone: "Asia/Manila",
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

function appendMessageOnce(prev, message) {
  if (message.id && prev.some((existing) => existing.id === message.id)) {
    return prev;
  }

  return [...prev, message];
}

export default function TournamentChat({ tournamentId }) {
  const { user }                      = useAuth();
  const isAdminUser                   = user && user.is_staff;

  const [messages,  setMessages]      = useState([]);
  const [anonName,  setAnonName]      = useState(() => localStorage.getItem("chat_name") ?? "");
  const [text,      setText]          = useState("");
  const [connected, setConnected]     = useState(false);
  const wsRef    = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    let ws;
    let retryTimer;
    let shouldReconnect = true;

    const connect = () => {
      ws = new WebSocket(`${WS_BASE}/ws/tournaments/${tournamentId}/chat/`);
      wsRef.current = ws;

      ws.onopen  = () => setConnected(true);
      ws.onclose = () => {
        setConnected(false);

        if (shouldReconnect) {
          retryTimer = setTimeout(connect, 3000);
        }
      };
      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.type === "history") {
            setMessages(data.messages);
          } else if (data.type === "message") {
            setMessages((prev) => appendMessageOnce(prev, data));
          }
        } catch {}
      };
    };

    connect();

    return () => {
      shouldReconnect = false;
      clearTimeout(retryTimer);

      if (wsRef.current === ws) {
        wsRef.current = null;
      }

      ws?.close();
    };
  }, [tournamentId]);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    if (wsRef.current?.readyState !== WebSocket.OPEN) return;

    // Persist anon name
    if (!isAdminUser && anonName.trim()) {
      localStorage.setItem("chat_name", anonName.trim());
    }

    wsRef.current.send(JSON.stringify({
      // Admin: server ignores author_name and forces "Admin"
      author_name: isAdminUser ? "Admin" : (anonName.trim() || "Anonymous"),
      message:     text.trim(),
    }));
    setText("");
  };
  return (
      <div className="card-cyan flex h-[460px] flex-col sm:h-[520px]">
        {/* Header */}
        <div className="mb-3 flex shrink-0 items-center justify-between border-b border-white/10 pb-3">
          <h3 className="flex items-center gap-2 font-game text-sm font-bold uppercase tracking-wider text-white">
            <ChatBubbleLeftRightIcon className="h-4 w-4 text-cyan" />
            Chat
            <span className="text-xs font-normal text-white/30">({messages.length})</span>
          </h3>
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${connected ? "bg-green-400" : "bg-red-400 animate-pulse"}`} />
          <span className={`text-xs font-game ${connected ? "text-green-400" : "text-red-400"}`}>
            {connected ? "Live" : "Reconnecting..."}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col items-center gap-2 pt-10 text-center font-game text-sm text-white/20">
            <ChatBubbleLeftRightIcon className="h-8 w-8 text-white/15" />
            <p>No messages yet. Say something!</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={m.id ?? i} className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              {m.is_admin ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-gold/30 bg-gold/15 px-2 py-0.5 font-game text-xs font-bold text-gold">
                  <ShieldCheckIcon className="h-3.5 w-3.5" />
                  Admin
                </span>
              ) : (
                <span className="text-cyan text-xs font-game font-semibold">{m.author_name}</span>
              )}
              <span className="text-white/20 text-xs">{formatTime(m.created_at)}</span>
            </div>
            <p className={`text-sm leading-snug ${m.is_admin ? "text-gold/90" : "text-white/80"}`}>
              {m.message}
            </p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="mt-3 pt-3 border-t border-white/10 shrink-0 space-y-2">
        {/* Name field - only for non-admin */}
        {!isAdminUser && (
          <input
            className="input py-2 text-sm"
            placeholder="Your name (optional - leave blank for Anonymous)"
            value={anonName}
            onChange={(e) => setAnonName(e.target.value)}
            maxLength={50}
          />
        )}
        {isAdminUser && (
          <div className="flex items-center gap-2 rounded-lg border border-gold/20 bg-gold/10 px-3 py-1.5">
            <ShieldCheckIcon className="h-4 w-4 text-gold" />
            <span className="font-game text-xs font-semibold text-gold">Chatting as Admin</span>
          </div>
        )}
        <div className="flex gap-2">
          <input
            className="input py-2 text-sm flex-1"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={500}
            disabled={!connected}
          />
          <button
            type="submit"
            disabled={!connected || !text.trim()}
            className="btn-cyan px-4 py-2 shrink-0 disabled:opacity-40"
          >
            <PaperAirplaneIcon className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
