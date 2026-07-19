import { useEffect, useState, useMemo, useRef } from "react";
import { Link }                                 from "react-router-dom";
import { getTournaments, createTournament, updateTournament } from "../api/tournaments";
import { getGames }                             from "../api/games";
import Spinner                                  from "../components/common/Spinner";

const STATUS_COLORS = {
  "Registration": "text-cyan border-cyan/30 bg-cyan/10",
  "In Progress":  "text-gold border-gold/30 bg-gold/10",
  "Completed":    "text-green-400 border-green-500/30 bg-green-500/10",
};

/** Convert a UTC ISO string → "YYYY-MM-DDTHH:MM" for datetime-local inputs */
function toLocalInput(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Format for display */
function fmtManila(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-PH", {
    timeZone: "Asia/Manila", dateStyle: "medium", timeStyle: "short",
  });
}

export default function AdminTournaments() {
  const [tournaments, setTournaments] = useState([]);
  const [games,       setGames]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [showForm,    setShowForm]    = useState(false);

  // Create form
  const [name,         setName]         = useState("");
  const [gameId,       setGameId]       = useState("");
  const [gameSearch,   setGameSearch]   = useState("");
  const [gameOpen,     setGameOpen]     = useState(false);
  const [teamSize,     setTeamSize]     = useState(2);
  const [scheduledAt,  setScheduledAt]  = useState("");
  const [regDeadline,  setRegDeadline]  = useState("");
  const [saving,       setSaving]       = useState(false);
  const [error,        setError]        = useState("");
  const gameRef = useRef(null);

  // Inline edit
  const [editingId,    setEditingId]    = useState(null);
  const [editScheduled, setEditScheduled] = useState("");
  const [editDeadline,  setEditDeadline]  = useState("");
  const [editSaving,   setEditSaving]   = useState(false);
  const [editError,    setEditError]    = useState("");

  useEffect(() => {
    getGames().then((r) => setGames(r.data.results ?? r.data));
  }, []);

  const fetchTournaments = () => {
    setLoading(true);
    getTournaments().then((r) => setTournaments(r.data.results ?? r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchTournaments(); }, []);

  useEffect(() => {
    const h = (e) => { if (gameRef.current && !gameRef.current.contains(e.target)) setGameOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const filteredGames = useMemo(() =>
    games.filter((g) => g.name.toLowerCase().includes(gameSearch.toLowerCase())),
    [games, gameSearch]
  );

  const selectedGame = games.find((g) => String(g.id) === String(gameId));

  const openForm = () => {
    setName(""); setGameId(""); setGameSearch(""); setTeamSize(2);
    setScheduledAt(""); setRegDeadline(""); setError("");
    setShowForm(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) return setError("Name is required.");
    if (!gameId)      return setError("Please select a game.");
    setSaving(true);
    try {
      await createTournament({
        name:                  name.trim(),
        game:                  gameId,
        team_size:             teamSize,
        scheduled_at:          scheduledAt  || null,
        registration_deadline: regDeadline  || null,
      });
      setShowForm(false);
      fetchTournaments();
    } catch (err) {
      const data = err.response?.data;
      setError(typeof data === "object" ? JSON.stringify(data) : data ?? "Error");
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (t) => {
    setEditingId(t.id);
    setEditScheduled(toLocalInput(t.scheduled_at));
    setEditDeadline(toLocalInput(t.registration_deadline));
    setEditError("");
  };

  const handleEditSave = async (t) => {
    setEditSaving(true);
    setEditError("");
    try {
      await updateTournament(t.id, {
        scheduled_at:          editScheduled || null,
        registration_deadline: editDeadline  || null,
      });
      setEditingId(null);
      fetchTournaments();
    } catch (err) {
      setEditError(err.response?.data?.detail ?? "Failed to save.");
    } finally {
      setEditSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-game font-bold text-2xl text-white">🏆 Tournaments</h1>
        <button onClick={openForm} className="btn-cyan">+ Create Tournament</button>
      </div>

      {loading ? <Spinner /> : (
        <div className="space-y-3">
          {tournaments.length === 0 && (
            <p className="text-white/30 text-center py-10">No tournaments yet.</p>
          )}
          {tournaments.map((t) => (
            <div key={t.id} className="card-cyan flex flex-col gap-3">
              {/* Row 1 — name + status + manage */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <span className="font-game font-bold text-white">{t.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${STATUS_COLORS[t.status]}`}>
                      {t.status}
                    </span>
                  </div>
                  <p className="text-white/40 text-xs font-game">
                    🕹️ {t.game_detail?.name} &nbsp;·&nbsp; 👥 {t.team_size}v{t.team_size} &nbsp;·&nbsp; {t.team_count} teams
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => editingId === t.id ? setEditingId(null) : openEdit(t)}
                    className={`text-xs py-1.5 px-3 rounded-lg border font-game font-semibold transition-all ${
                      editingId === t.id
                        ? "bg-white/5 border-white/10 text-white/40"
                        : "bg-white/5 border-white/10 text-white/50 hover:text-white hover:border-white/30"
                    }`}
                  >
                    {editingId === t.id ? "Cancel" : "✏️ Edit Dates"}
                  </button>
                  <Link to={`/admin/tournaments/${t.id}`} className="btn-cyan text-xs py-1.5 px-3">
                    Manage
                  </Link>
                </div>
              </div>

              {/* Row 2 — date info */}
              {editingId !== t.id && (
                <div className="flex flex-wrap gap-4 text-xs text-white/30 font-game border-t border-white/5 pt-2">
                  <span>📅 Starts: <span className="text-white/50">{fmtManila(t.scheduled_at)}</span></span>
                  <span>⏳ Deadline: <span className="text-white/50">{fmtManila(t.registration_deadline)}</span></span>
                </div>
              )}

              {/* Inline edit panel */}
              {editingId === t.id && (
                <div className="border-t border-cyan/20 pt-3 space-y-3">
                  {editError && (
                    <p className="text-red-400 text-xs">⚠️ {editError}</p>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-white/50 text-xs font-game uppercase tracking-wider mb-1">
                        📅 Scheduled Date & Time
                      </label>
                      <input type="datetime-local" className="input text-sm py-2"
                        value={editScheduled} onChange={(e) => setEditScheduled(e.target.value)} />
                      <p className="text-white/20 text-xs mt-0.5">Asia/Manila</p>
                    </div>
                    <div>
                      <label className="block text-white/50 text-xs font-game uppercase tracking-wider mb-1">
                        ⏳ Registration Deadline
                      </label>
                      <input type="datetime-local" className="input text-sm py-2"
                        value={editDeadline} onChange={(e) => setEditDeadline(e.target.value)} />
                      <p className="text-white/20 text-xs mt-0.5">Leave blank for no deadline</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEditSave(t)} disabled={editSaving}
                      className="btn-gold text-xs py-1.5 px-4">
                      {editSaving ? "Saving…" : "Save"}
                    </button>
                    <button onClick={() => setEditingId(null)} className="btn-danger text-xs py-1.5 px-4">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Create modal ─────────────────────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card-cyan w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-game font-bold text-lg text-white">New Tournament</h2>
              <button onClick={() => setShowForm(false)} className="text-white/40 hover:text-white text-xl">✕</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              {error && (
                <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  ⚠️ {error}
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-white/60 text-xs font-game uppercase tracking-wider mb-1.5">
                  Tournament Name *
                </label>
                <input className="input" placeholder="e.g. Valorant Summer Cup"
                  value={name} onChange={(e) => setName(e.target.value)} required />
              </div>

              {/* Game — searchable dropdown */}
              <div>
                <label className="block text-white/60 text-xs font-game uppercase tracking-wider mb-1.5">
                  Game * {games.length === 0 && <span className="text-red-400/60">(no games found)</span>}
                </label>
                <div className="relative" ref={gameRef}>
                  <div
                    onClick={() => { setGameOpen((o) => !o); setGameSearch(""); }}
                    className={`input flex items-center justify-between cursor-pointer gap-2 ${gameOpen ? "border-cyan/60 ring-1 ring-cyan/30" : ""}`}
                  >
                    {selectedGame ? (
                      <div className="flex items-center gap-2">
                        <span className="text-cyan text-sm">🕹️</span>
                        <span className="text-white text-sm font-semibold">{selectedGame.name}</span>
                        <span className="text-white/30 text-xs">{selectedGame.player_count_label} players</span>
                      </div>
                    ) : (
                      <span className="text-white/30 text-sm">Select a game…</span>
                    )}
                    <span className={`text-white/30 text-xs transition-transform duration-200 ${gameOpen ? "rotate-180" : ""}`}>▼</span>
                  </div>

                  {gameOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-navy-800 border border-cyan/30 rounded-xl shadow-cyan overflow-hidden">
                      <div className="p-2 border-b border-white/10">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">🔍</span>
                          <input autoFocus className="input pl-9 py-2 text-sm" placeholder="Search games…"
                            value={gameSearch} onChange={(e) => setGameSearch(e.target.value)}
                            onClick={(e) => e.stopPropagation()} />
                          {gameSearch && (
                            <button type="button"
                              onClick={(e) => { e.stopPropagation(); setGameSearch(""); }}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white text-sm">✕</button>
                          )}
                        </div>
                      </div>
                      <ul className="overflow-y-auto" style={{ maxHeight: "200px" }}>
                        {filteredGames.length === 0
                          ? <li className="px-4 py-3 text-white/30 text-sm text-center">
                              {gameSearch ? `No games match "${gameSearch}"` : "No games available."}
                            </li>
                          : filteredGames.map((g) => (
                            <li key={g.id}
                              onClick={() => { setGameId(String(g.id)); setGameOpen(false); setGameSearch(""); }}
                              className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-all duration-100 ${
                                String(gameId) === String(g.id) ? "bg-cyan/10 text-cyan" : "text-white/70 hover:bg-white/5 hover:text-white"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span>🕹️</span>
                                <div>
                                  <p className="font-game font-semibold text-sm">{g.name}</p>
                                  <p className="text-white/30 text-xs">{g.player_count_label} players</p>
                                </div>
                              </div>
                              {String(gameId) === String(g.id) && <span className="text-cyan text-sm">✓</span>}
                            </li>
                          ))
                        }
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Team size */}
              <div>
                <label className="block text-white/60 text-xs font-game uppercase tracking-wider mb-1.5">
                  Players Per Team *
                </label>
                <input className="input" type="number" min="1" max="20"
                  value={teamSize} onChange={(e) => setTeamSize(parseInt(e.target.value, 10))} />
                <p className="text-white/20 text-xs mt-1">e.g. 5 = 5v5, 2 = 2v2, 1 = 1v1</p>
              </div>

              {/* Scheduled date */}
              <div>
                <label className="block text-white/60 text-xs font-game uppercase tracking-wider mb-1.5">
                  📅 Scheduled Date & Time <span className="text-white/30">(Asia/Manila)</span>
                </label>
                <input type="datetime-local" className="input"
                  value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
                <p className="text-white/20 text-xs mt-1">Leave blank if date not confirmed yet</p>
              </div>

              {/* Registration deadline */}
              <div>
                <label className="block text-white/60 text-xs font-game uppercase tracking-wider mb-1.5">
                  ⏳ Registration Deadline <span className="text-white/30">(optional)</span>
                </label>
                <input type="datetime-local" className="input"
                  value={regDeadline} onChange={(e) => setRegDeadline(e.target.value)} />
                <p className="text-white/20 text-xs mt-1">After this, no new teams can register</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-gold flex-1 justify-center">
                  {saving ? "Creating…" : "Create"}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-danger flex-1 justify-center">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
