import {useState, useEffect, useMemo, useRef} from "react";
import {useNavigate} from "react-router-dom";
import {getGames} from "../api/games";
import {getAllActivePlayers} from "../api/players";
import {submitMatch} from "../api/matches";

function useManilaTime() {
    const [label, setLabel] = useState("");
    useEffect(() => {
        const fmt = () =>
            new Date().toLocaleString("en-PH", {
                timeZone: "Asia/Manila",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true,
            });
        setLabel(fmt());
        const id = setInterval(() => setLabel(fmt()), 1000);
        return () => clearInterval(id);
    }, []);
    return label;
}

export default function SubmitMatch() {
    const navigate = useNavigate();

    const [games, setGames] = useState([]);
    const [players, setPlayers] = useState([]);
    const [gameId, setGameId] = useState("");
    const [gameSearch, setGameSearch] = useState("");
    const [gameOpen, setGameOpen] = useState(false);
    const gameRef = useRef(null);
    const [submittedBy, setSubmittedBy] = useState("");   // stores nickname
    const [submitterSearch, setSubmitterSearch] = useState("");   // dropdown filter
    const [submitterOpen, setSubmitterOpen] = useState(false);
    const submitterRef = useRef(null);
    const [participantIds, setParticipantIds] = useState([]);
    const [winnerIds, setWinnerIds] = useState([]);
    const [proof, setProof] = useState(null);
    const [proofPreview, setProofPreview] = useState(null);
    const [notes, setNotes] = useState("");
    const [search, setSearch] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const manilaTime = useManilaTime();

    useEffect(() => {
        getGames().then((r) => setGames(r.data.results ?? r.data));
        getAllActivePlayers().then((r) => setPlayers(r.data.results ?? r.data));
    }, []);

    // Close submitter dropdown when clicking outside
    useEffect(() => {
        const handler = (e) => {
            if (submitterRef.current && !submitterRef.current.contains(e.target)) {
                setSubmitterOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // Close game dropdown when clicking outside
    useEffect(() => {
        const handler = (e) => {
            if (gameRef.current && !gameRef.current.contains(e.target)) {
                setGameOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // Filtered game list
    const filteredGames = useMemo(() =>
            games.filter((g) =>
                g.name.toLowerCase().includes(gameSearch.toLowerCase())
            ),
        [games, gameSearch]
    );

    // Filtered submitter list
    const filteredSubmitters = useMemo(() =>
            players.filter((p) =>
                p.nickname.toLowerCase().includes(submitterSearch.toLowerCase()) ||
                p.fullname.toLowerCase().includes(submitterSearch.toLowerCase())
            ),
        [players, submitterSearch]
    );

    // Filtered list for the scrollable grid
    const filtered = useMemo(() =>
            players.filter((p) =>
                p.nickname.toLowerCase().includes(search.toLowerCase()) ||
                p.fullname.toLowerCase().includes(search.toLowerCase())
            ),
        [players, search]
    );

    const toggleParticipant = (id) => {
        setParticipantIds((prev) => {
            if (prev.includes(id)) {
                setWinnerIds((w) => w.filter((x) => x !== id));
                return prev.filter((x) => x !== id);
            }
            return [...prev, id];
        });
    };

    const toggleWinner = (id) => {
        if (!participantIds.includes(id)) return;
        setWinnerIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const handleProofChange = (e) => {
        const file = e.target.files[0];
        setProof(file);
        if (file) setProofPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (!gameId) return setError("Please select a game.");
        if (!submittedBy) return setError("Please select who is submitting.");
        if (participantIds.length < 2) return setError("Select at least 2 players.");
        if (winnerIds.length === 0) return setError("Select at least one winner.");
        if (!proof) return setError("Proof photo is required.");

        const fd = new FormData();
        fd.append("game", gameId);
        fd.append("submitted_by_name", submittedBy);
        fd.append("notes", notes);
        fd.append("proof_image", proof);
        participantIds.forEach((id) => fd.append("participant_ids", id));
        winnerIds.forEach((id) => fd.append("winner_ids", id));

        setLoading(true);
        try {
            await submitMatch(fd);
            navigate("/matches");
        } catch (err) {
            const data = err.response?.data;
            if (data && typeof data === "object") {
                const msgs = Object.entries(data)
                    .flatMap(([, v]) => (Array.isArray(v) ? v : [v]))
                    .join(" ");
                setError(msgs);
            } else {
                setError(data ?? "Something went wrong.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            {/* Heading */}
            <div className="text-center mb-8">
                <h1 className="font-game font-bold text-3xl text-white uppercase tracking-wider">
                    SUBMIT <span className="text-cyan">MATCH</span>
                </h1>

                <p className="text-white/40 text-sm mt-2">
                    Submit a completed match for review and approval.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="card-cyan space-y-5">
                {error && (
                    <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {/* Submission timestamp — auto-generated, read-only */}
                <div>
                    <label className="block text-white/60 text-xs font-game uppercase tracking-wider mb-2">
                        Submission Timestamp
                    </label>
                    <div
                        className="input bg-navy-700/50 text-cyan font-game font-semibold cursor-not-allowed select-none flex items-center gap-2">
                        <span>{manilaTime}</span>
                        <span className="ml-auto text-white/20 text-xs">
                          Auto Generated
                        </span>
                    </div>
                    <p className="text-white/20 text-xs mt-1">
                        Automatically recorded when the match is submitted.
                    </p>
                </div>

                {/* Submitted by — searchable dropdown */}
                <div>
                    <label className="block text-white/60 text-xs font-game uppercase tracking-wider mb-2">
                        Submitted By
                    </label>
                    <div className="relative" ref={submitterRef}>
                        {/* Trigger input */}
                        <div
                            className={`input flex items-center justify-between cursor-pointer gap-2 ${
                                submitterOpen ? "border-cyan/60 ring-1 ring-cyan/30" : ""
                            }`}
                            onClick={() => {
                                setSubmitterOpen((o) => !o);
                                setSubmitterSearch("");
                            }}
                        >
                            {submittedBy ? (
                                <div className="flex items-center gap-2">
                                    {(() => {
                                        const p = players.find((x) => x.nickname === submittedBy);
                                        return p?.photo
                                            ? <img src={p.photo} alt=""
                                                   className="w-6 h-6 rounded-full object-cover shrink-0"/>
                                            : <div
                                                className="w-6 h-6 rounded-full bg-cyan/20 flex items-center justify-center text-cyan text-xs font-bold shrink-0">
                                                {submittedBy[0]?.toUpperCase()}
                                            </div>;
                                    })()}
                                    <span className="text-white text-sm font-semibold">{submittedBy}</span>
                                </div>
                            ) : (
                                <span className="text-white/30 text-sm">Select a player</span>
                            )}
                            <span
                                className={`text-white/30 text-xs transition-transform duration-200 ${submitterOpen ? "rotate-180" : ""}`}>▼</span>
                        </div>

                        {/* Dropdown panel */}
                        {submitterOpen && (
                            <div
                                className="absolute z-50 w-full mt-1 bg-navy-800 border border-cyan/30 rounded-xl shadow-cyan overflow-hidden">
                                {/* Search input inside dropdown */}
                                <div className="p-2 border-b border-white/10">
                                    <div className="relative">
                                        <span
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">🔍</span>
                                        <input
                                            autoFocus
                                            className="input pl-9 py-2 text-sm"
                                            placeholder="Search players"
                                            value={submitterSearch}
                                            onChange={(e) => setSubmitterSearch(e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        {submitterSearch && (
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSubmitterSearch("");
                                                }}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white text-sm"
                                            >✕</button>
                                        )}
                                    </div>
                                </div>

                                {/* Options list — max 5 rows visible */}
                                <ul className="overflow-y-auto" style={{maxHeight: "220px"}}>
                                    {filteredSubmitters.length === 0 ? (
                                        <li className="px-4 py-3 text-white/30 text-sm text-center">No matching players
                                            found.</li>
                                    ) : (
                                        filteredSubmitters.map((p) => (
                                            <li
                                                key={p.id}
                                                onClick={() => {
                                                    setSubmittedBy(p.nickname);
                                                    setSubmitterOpen(false);
                                                    setSubmitterSearch("");
                                                }}
                                                className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-all duration-100 ${
                                                    submittedBy === p.nickname
                                                        ? "bg-cyan/10 text-cyan"
                                                        : "text-white/70 hover:bg-white/5 hover:text-white"
                                                }`}
                                            >
                                                <div
                                                    className="w-8 h-8 rounded-full overflow-hidden border border-white/10 shrink-0">
                                                    {p.photo
                                                        ? <img src={p.photo} alt={p.nickname}
                                                               className="w-full h-full object-cover"/>
                                                        : <div
                                                            className={`w-full h-full flex items-center justify-center text-xs font-bold ${
                                                                submittedBy === p.nickname ? "bg-cyan/20 text-cyan" : "bg-navy-600 text-white/40"
                                                            }`}>
                                                            {p.nickname?.[0]?.toUpperCase()}
                                                        </div>
                                                    }
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold font-game text-sm truncate">{p.nickname}</p>
                                                    <p className="text-white/30 text-xs truncate">{p.fullname}</p>
                                                </div>
                                                {submittedBy === p.nickname && (
                                                    <span className="text-cyan text-sm shrink-0">✓</span>
                                                )}
                                            </li>
                                        ))
                                    )}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                {/* Game — searchable dropdown */}
                <div>
                    <label className="block text-white/60 text-xs font-game uppercase tracking-wider mb-2">
                        Game
                    </label>
                    <div className="relative" ref={gameRef}>
                        {/* Trigger */}
                        <div
                            className={`input flex items-center justify-between cursor-pointer gap-2 ${
                                gameOpen ? "border-cyan/60 ring-1 ring-cyan/30" : ""
                            }`}
                            onClick={() => {
                                setGameOpen((o) => !o);
                                setGameSearch("");
                            }}
                        >
                            {gameId ? (
                                <div className="flex items-center gap-2">
                                    <span className="text-cyan text-sm">🕹️</span>
                                    <div>
                    <span className="text-white text-sm font-semibold">
                      {games.find((g) => String(g.id) === String(gameId))?.name}
                    </span>
                                        <span className="text-white/30 text-xs ml-2">
                      {games.find((g) => String(g.id) === String(gameId))?.player_count_label} players
                    </span>
                                    </div>
                                </div>
                            ) : (
                                <span className="text-white/30 text-sm">Choose a game</span>
                            )}
                            <span
                                className={`text-white/30 text-xs transition-transform duration-200 ${gameOpen ? "rotate-180" : ""}`}>▼</span>
                        </div>

                        {/* Dropdown panel */}
                        {gameOpen && (
                            <div
                                className="absolute z-50 w-full mt-1 bg-navy-800 border border-cyan/30 rounded-xl shadow-cyan overflow-hidden">
                                {/* Search */}
                                <div className="p-2 border-b border-white/10">
                                    <div className="relative">
                                        <span
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">🔍</span>
                                        <input
                                            autoFocus
                                            className="input pl-9 py-2 text-sm"
                                            placeholder="Search games"
                                            value={gameSearch}
                                            onChange={(e) => setGameSearch(e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        {gameSearch && (
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setGameSearch("");
                                                }}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white text-sm"
                                            >✕</button>
                                        )}
                                    </div>
                                </div>

                                {/* Options */}
                                <ul className="overflow-y-auto" style={{maxHeight: "220px"}}>
                                    {filteredGames.length === 0 ? (
                                        <li className="px-4 py-3 text-white/30 text-sm text-center">
                                            No matching games found.
                                        </li>
                                    ) : (
                                        filteredGames.map((g) => (
                                            <li
                                                key={g.id}
                                                onClick={() => {
                                                    setGameId(String(g.id));
                                                    setGameOpen(false);
                                                    setGameSearch("");
                                                }}
                                                className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-all duration-100 ${
                                                    String(gameId) === String(g.id)
                                                        ? "bg-cyan/10 text-cyan"
                                                        : "text-white/70 hover:bg-white/5 hover:text-white"
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-lg">🕹️</span>
                                                    <div>
                                                        <p className="font-game font-semibold text-sm">{g.name}</p>
                                                        <p className="text-white/30 text-xs">{g.player_count_label} players</p>
                                                    </div>
                                                </div>
                                                {String(gameId) === String(g.id) && (
                                                    <span className="text-cyan text-sm shrink-0">✓</span>
                                                )}
                                            </li>
                                        ))
                                    )}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Player picker ──────────────────────────────────── */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-white/60 text-xs font-game uppercase tracking-wider">
                            Participants
                        </label>
                        {participantIds.length > 0 && (
                            <span className="text-cyan text-xs font-semibold">
                {participantIds.length} selected
              </span>
                        )}
                    </div>

                    {/* Search bar */}
                    <div className="relative mb-2">
                        <input
                            className="input py-2 text-sm"
                            placeholder="Search participants"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white text-sm"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    {/* Scrollable 3-column grid — shows ~3 rows (9 players) then scrolls */}
                    <div
                        className="overflow-y-auto rounded-xl border border-white/10 bg-navy-700/40"
                        style={{maxHeight: "252px"}}  /* ~3 rows × 84px each */
                    >
                        {filtered.length === 0 ? (
                            <p className="text-white/30 text-xs text-center py-8">No matching players found.</p>
                        ) : (
                            <div className="grid grid-cols-3 gap-2 p-2">
                                {filtered.map((p) => {
                                    const isParticipant = participantIds.includes(p.id);
                                    const isWinner = winnerIds.includes(p.id);
                                    return (
                                        <button
                                            type="button"
                                            key={p.id}
                                            onClick={() => toggleParticipant(p.id)}
                                            className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border transition-all duration-150 select-none focus:outline-none ${
                                                isWinner
                                                    ? "bg-gold/10 border-gold/50 shadow-gold"
                                                    : isParticipant
                                                        ? "bg-cyan/10 border-cyan/50 shadow-cyan"
                                                        : "bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10"
                                            }`}
                                        >
                                            {/* Avatar */}
                                            <div className={`w-11 h-11 rounded-full overflow-hidden border-2 shrink-0 ${
                                                isWinner ? "border-gold/60" : isParticipant ? "border-cyan/60" : "border-white/20"
                                            }`}>
                                                {p.photo
                                                    ? <img src={p.photo} alt={p.nickname}
                                                           className="w-full h-full object-cover"/>
                                                    : <div
                                                        className={`w-full h-full flex items-center justify-center font-bold font-game text-sm ${
                                                            isWinner ? "bg-gold/20 text-gold" : isParticipant ? "bg-cyan/20 text-cyan" : "bg-navy-600 text-white/40"
                                                        }`}>
                                                        {p.nickname?.[0]?.toUpperCase()}
                                                    </div>
                                                }
                                            </div>
                                            {/* Name */}
                                            <span
                                                className={`text-xs font-semibold font-game truncate w-full text-center ${
                                                    isWinner ? "text-gold" : isParticipant ? "text-cyan" : "text-white/60"
                                                }`}>
                        {p.nickname}
                      </span>
                                            {/* Status pill */}
                                            {isWinner && (
                                                <span className="text-xs text-gold leading-none">Winner</span>
                                            )}
                                            {isParticipant && !isWinner && (
                                                <span className="text-xs text-cyan/70 leading-none">Selected</span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <p className="text-white/20 text-xs mt-1.5">
                        Select all players who participated in the match.
                    </p>
                </div>

                {/* ── Winner picker — only selected participants ──────── */}
                {participantIds.length > 0 && (
                    <div>
                        <label className="block text-white/60 text-xs font-game uppercase tracking-wider mb-2">
                            Winner(s)
                        </label>
                        <p className="text-white/30 text-xs mb-2">
                            Select one or more winners from the participants above.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {participantIds.map((pid) => {
                                const p = players.find((x) => x.id === pid);
                                if (!p) return null;
                                const isWinner = winnerIds.includes(pid);
                                return (
                                    <button
                                        type="button"
                                        key={pid}
                                        onClick={() => toggleWinner(pid)}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold transition-all duration-150 ${
                                            isWinner
                                                ? "bg-gold/15 border-gold/50 text-gold shadow-gold"
                                                : "bg-white/5 border-white/10 text-white/50 hover:border-cyan/30 hover:text-cyan"
                                        }`}
                                    >
                                        <div
                                            className="w-6 h-6 rounded-full overflow-hidden border border-white/20 shrink-0">
                                            {p.photo
                                                ? <img src={p.photo} alt={p.nickname}
                                                       className="w-full h-full object-cover"/>
                                                : <div
                                                    className="w-full h-full bg-navy-600 flex items-center justify-center text-xs font-bold">
                                                    {p.nickname?.[0]}
                                                </div>
                                            }
                                        </div>
                                        {isWinner ? "🏆" : "👤"} {p.nickname}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Proof image */}
                <div>
                    <label className="block text-white/60 text-xs font-game uppercase tracking-wider mb-2">
                        Match Evidence <span className="text-red-400">*</span>
                    </label>
                    {proofPreview && (
                        <div className="mb-3 rounded-xl overflow-hidden border border-white/10 max-h-48">
                            <img src={proofPreview} alt="Preview" className="w-full object-cover max-h-48"/>
                        </div>
                    )}
                    <label className="btn-cyan w-full justify-center cursor-pointer">
                        Upload Image
                        <input type="file" accept="image/*" className="hidden" onChange={handleProofChange}/>
                    </label>
                </div>

                {/* Notes */}
                <div>
                    <label className="block text-white/60 text-xs font-game uppercase tracking-wider mb-2">
                        Notes (optional)
                    </label>
                    <textarea
                        className="input resize-none"
                        rows={3}
                        placeholder="Additional details (optional)"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                </div>

                {/* Submit */}
                <button type="submit" disabled={loading} className="btn-gold w-full justify-center text-base py-4">
                    {loading ? "Submitting..." : "Submit Match"}
                </button>
            </form>
        </div>
    );
}
