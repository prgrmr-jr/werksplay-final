import {useState, useEffect, useMemo, useRef} from "react";
import {useNavigate} from "react-router-dom";
import {getAllActivePlayers} from "../api/players";
import {getGames} from "../api/games";
import {submitSideQuest} from "../api/sidequests";

/** Live Manila time string, updates every second */
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

export default function SubmitSideQuest() {
    const navigate = useNavigate();

    // Data
    const [players, setPlayers] = useState([]);
    const [games, setGames] = useState([]);

    // Player picker
    const [playerId, setPlayerId] = useState("");
    const [playerSearch, setPlayerSearch] = useState("");
    const [playerOpen, setPlayerOpen] = useState(false);
    const playerRef = useRef(null);

    // Game picker
    const [gameId, setGameId] = useState("");
    const [gameSearch, setGameSearch] = useState("");
    const [gameOpen, setGameOpen] = useState(false);
    const gameRef = useRef(null);

    // Form fields
    const [currentRank, setCurrentRank] = useState("");
    const [highestRank, setHighestRank] = useState("");
    const [goal, setGoal] = useState("");
    const [notes, setNotes] = useState("");
    const [proof, setProof] = useState(null);
    const [proofPreview, setProofPreview] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const manilaTime = useManilaTime();

    useEffect(() => {
        getAllActivePlayers().then((r) => setPlayers(r.data.results ?? r.data));
        getGames().then((r) => setGames(r.data.results ?? r.data));
    }, []);

    // Click-outside: player
    useEffect(() => {
        const h = (e) => {
            if (playerRef.current && !playerRef.current.contains(e.target)) setPlayerOpen(false);
        };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);

    // Click-outside: game
    useEffect(() => {
        const h = (e) => {
            if (gameRef.current && !gameRef.current.contains(e.target)) setGameOpen(false);
        };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);

    const filteredPlayers = useMemo(() =>
        players.filter((p) =>
            p.nickname.toLowerCase().includes(playerSearch.toLowerCase()) ||
            p.fullname.toLowerCase().includes(playerSearch.toLowerCase())
        ), [players, playerSearch]);

    const filteredGames = useMemo(() =>
        games.filter((g) =>
            g.name.toLowerCase().includes(gameSearch.toLowerCase())
        ), [games, gameSearch]);

    const selectedPlayer = players.find((p) => String(p.id) === String(playerId));
    const selectedGame = games.find((g) => String(g.id) === String(gameId));

    const handleProofChange = (e) => {
        const file = e.target.files[0];
        setProof(file);
        if (file) setProofPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (!playerId) return setError("Please select a player.");
        if (!gameId) return setError("Please select a game.");
        if (!goal.trim()) return setError("Please enter a goal.");

        const fd = new FormData();
        fd.append("player", playerId);
        fd.append("game", gameId);
        fd.append("goal", goal);
        fd.append("current_rank", currentRank);
        fd.append("highest_rank", highestRank);
        fd.append("notes", notes);
        if (proof) fd.append("proof_image", proof);

        setLoading(true);
        try {
            await submitSideQuest(fd);
            navigate("/sidequests");
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
            <div className="text-center mb-8">
                <h1 className="font-game font-bold text-3xl text-white uppercase tracking-wider">
                    SUBMIT <span className="text-purple">SIDE QUEST</span>
                </h1>

                <p className="text-white/40 text-sm mt-2">
                    Submit a personal gaming goal for approval and tracking.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="card-purple space-y-5">
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
                        className="input bg-navy-700/50 text-purple font-game font-semibold cursor-not-allowed select-none flex items-center gap-2">
                        <span>{manilaTime}</span>
                        <span className="ml-auto text-white/20 text-xs">Auto Generated</span>
                    </div>
                    <p className="text-white/20 text-xs mt-1">
                        Automatically recorded when the request is submitted.
                    </p>
                </div>

                {/* ── Requested By ─────────────────────────────────────── */}
                <div>
                    <label className="block text-white/60 text-xs font-game uppercase tracking-wider mb-2">
                        Requested By
                    </label>
                    <div className="relative" ref={playerRef}>
                        <div
                            className={`input flex items-center justify-between cursor-pointer gap-2 ${playerOpen ? "border-purple/60 ring-1 ring-purple/30" : ""}`}
                            onClick={() => {
                                setPlayerOpen((o) => !o);
                                setPlayerSearch("");
                            }}
                        >
                            {selectedPlayer ? (
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-6 h-6 rounded-full overflow-hidden border border-purple/30 shrink-0">
                                        {selectedPlayer.photo
                                            ? <img src={selectedPlayer.photo} alt=""
                                                   className="w-full h-full object-cover"/>
                                            : <div
                                                className="w-full h-full bg-purple/20 flex items-center justify-center text-purple text-xs font-bold">
                                                {selectedPlayer.nickname?.[0]?.toUpperCase()}
                                            </div>}
                                    </div>
                                    <span className="text-white text-sm font-semibold">{selectedPlayer.nickname}</span>
                                    <span className="text-white/30 text-xs">{selectedPlayer.fullname}</span>
                                </div>
                            ) : (
                                <span className="text-white/30 text-sm">Select a player</span>
                            )}
                            <span
                                className={`text-white/30 text-xs transition-transform duration-200 ${playerOpen ? "rotate-180" : ""}`}>▼</span>
                        </div>

                        {playerOpen && (
                            <div
                                className="absolute z-50 w-full mt-1 bg-navy-800 border border-purple/30 rounded-xl shadow-purple overflow-hidden">
                                <div className="p-2 border-b border-white/10">
                                    <div className="relative">
                                        <span
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">🔍</span>
                                        <input autoFocus className="input pl-9 py-2 text-sm"
                                               placeholder="Search players"
                                               value={playerSearch} onChange={(e) => setPlayerSearch(e.target.value)}
                                               onClick={(e) => e.stopPropagation()}/>
                                        {playerSearch && (
                                            <button type="button" onClick={(e) => {
                                                e.stopPropagation();
                                                setPlayerSearch("");
                                            }}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white text-sm">✕</button>
                                        )}
                                    </div>
                                </div>
                                <ul className="overflow-y-auto" style={{maxHeight: "220px"}}>
                                    {filteredPlayers.length === 0
                                        ?
                                        <li className="px-4 py-3 text-white/30 text-sm text-center">No matching players
                                            found.</li>
                                        : filteredPlayers.map((p) => (
                                            <li key={p.id} onClick={() => {
                                                setPlayerId(String(p.id));
                                                setPlayerOpen(false);
                                                setPlayerSearch("");
                                            }}
                                                className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-all duration-100 ${
                                                    String(playerId) === String(p.id) ? "bg-purple/10 text-purple" : "text-white/70 hover:bg-white/5 hover:text-white"
                                                }`}>
                                                <div
                                                    className="w-8 h-8 rounded-full overflow-hidden border border-white/10 shrink-0">
                                                    {p.photo
                                                        ? <img src={p.photo} alt={p.nickname}
                                                               className="w-full h-full object-cover"/>
                                                        : <div
                                                            className={`w-full h-full flex items-center justify-center text-xs font-bold ${String(playerId) === String(p.id) ? "bg-purple/20 text-purple" : "bg-navy-600 text-white/40"}`}>
                                                            {p.nickname?.[0]?.toUpperCase()}
                                                        </div>}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-game font-semibold text-sm truncate">{p.nickname}</p>
                                                    <p className="text-white/30 text-xs truncate">{p.fullname}</p>
                                                </div>
                                                {String(playerId) === String(p.id) &&
                                                    <span className="text-purple text-sm shrink-0">✓</span>}
                                            </li>
                                        ))
                                    }
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Game ─────────────────────────────────────────────── */}
                <div>
                    <label className="block text-white/60 text-xs font-game uppercase tracking-wider mb-2">
                        Game <span className="text-red-400">*</span>
                    </label>
                    <div className="relative" ref={gameRef}>
                        <div
                            className={`input flex items-center justify-between cursor-pointer gap-2 ${gameOpen ? "border-purple/60 ring-1 ring-purple/30" : ""}`}
                            onClick={() => {
                                setGameOpen((o) => !o);
                                setGameSearch("");
                            }}
                        >
                            {selectedGame ? (
                                <div className="flex items-center gap-2">
                                    <span className="text-white text-sm font-semibold">{selectedGame.name}</span>
                                    <span
                                        className="text-white/30 text-xs">{selectedGame.player_count_label} players</span>
                                </div>
                            ) : (
                                <span className="text-white/30 text-sm">Choose a game</span>
                            )}
                            <span
                                className={`text-white/30 text-xs transition-transform duration-200 ${gameOpen ? "rotate-180" : ""}`}>▼</span>
                        </div>

                        {gameOpen && (
                            <div
                                className="absolute z-50 w-full mt-1 bg-navy-800 border border-purple/30 rounded-xl shadow-purple overflow-hidden">
                                <div className="p-2 border-b border-white/10">
                                    <div className="relative">
                                        <span
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">🔍</span>
                                        <input autoFocus className="input pl-9 py-2 text-sm" placeholder="Search games"
                                               value={gameSearch} onChange={(e) => setGameSearch(e.target.value)}
                                               onClick={(e) => e.stopPropagation()}/>
                                        {gameSearch && (
                                            <button type="button" onClick={(e) => {
                                                e.stopPropagation();
                                                setGameSearch("");
                                            }}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white text-sm">✕</button>
                                        )}
                                    </div>
                                </div>
                                <ul className="overflow-y-auto" style={{maxHeight: "220px"}}>
                                    {filteredGames.length === 0
                                        ? <li className="px-4 py-3 text-white/30 text-sm text-center">No matching games
                                            found.</li>
                                        : filteredGames.map((g) => (
                                            <li key={g.id} onClick={() => {
                                                setGameId(String(g.id));
                                                setGameOpen(false);
                                                setGameSearch("");
                                            }}
                                                className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-all duration-100 ${
                                                    String(gameId) === String(g.id) ? "bg-purple/10 text-purple" : "text-white/70 hover:bg-white/5 hover:text-white"
                                                }`}>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-lg">🕹️</span>
                                                    <div>
                                                        <p className="font-game font-semibold text-sm">{g.name}</p>
                                                        <p className="text-white/30 text-xs">{g.player_count_label} players</p>
                                                    </div>
                                                </div>
                                                {String(gameId) === String(g.id) &&
                                                    <span className="text-purple text-sm shrink-0">✓</span>}
                                            </li>
                                        ))
                                    }
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                {/* Current / Highest Rank */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-white/60 text-xs font-game uppercase tracking-wider mb-2">Current
                            Rank</label>
                        <input className="input" placeholder="Current rank" value={currentRank}
                               onChange={(e) => setCurrentRank(e.target.value)}/>
                    </div>
                    <div>
                        <label className="block text-white/60 text-xs font-game uppercase tracking-wider mb-2">Highest
                            Rank</label>
                        <input className="input" placeholder="Highest rank achieved" value={highestRank}
                               onChange={(e) => setHighestRank(e.target.value)}/>
                    </div>
                </div>

                {/* Goal */}
                <div>
                    <label className="block text-white/60 text-xs font-game uppercase tracking-wider mb-2">
                        Goal <span className="text-red-400">*</span>
                    </label>
                    <textarea className="input resize-none" rows={4}
                              placeholder="Describe your objective or target."
                              value={goal} onChange={(e) => setGoal(e.target.value)}/>
                </div>

                {/* Proof image */}
                <div>
                    <label className="block text-white/60 text-xs font-game uppercase tracking-wider mb-2">
                        Supporting Evidence
                    </label>
                    {proofPreview && (
                        <div className="mb-3 rounded-xl overflow-hidden border border-white/10 max-h-48">
                            <img src={proofPreview} alt="Preview" className="w-full object-cover max-h-48"/>
                        </div>
                    )}
                    <label className="btn-purple w-full justify-center cursor-pointer">
                        Upload Image
                        <input type="file" accept="image/*" className="hidden" onChange={handleProofChange}/>
                    </label>
                </div>

                {/* Notes */}
                <div>
                    <label className="block text-white/60 text-xs font-game uppercase tracking-wider mb-2">Notes
                        (optional)</label>
                    <textarea className="input resize-none" rows={3} placeholder="Additional details (optional)"
                              value={notes} onChange={(e) => setNotes(e.target.value)}/>
                </div>

                <button type="submit" disabled={loading} className="btn-gold w-full justify-center text-base py-4">
                    {loading ? "Submitting..." : "Submit Side Quest"}
                </button>
            </form>
        </div>
    );
}
