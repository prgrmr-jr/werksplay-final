import {useState, useEffect, useMemo} from "react";
import {getGames, createGame, updateGame} from "../api/games";
import Spinner from "../components/common/Spinner";

export default function AdminGames() {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);

    const [search, setSearch] = useState("");

    const [name, setName] = useState("");
    const [minPlayers, setMinPlayers] = useState(2);
    const [maxPlayers, setMaxPlayers] = useState("");
    const [isActive, setIsActive] = useState(true);

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const fetchGames = () => {
        setLoading(true);

        getGames()
            .then((r) => {
                setGames(r.data.results ?? r.data);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchGames();
    }, []);

    const filteredGames = useMemo(() => {
        return games.filter((g) =>
            g.name.toLowerCase().includes(search.toLowerCase())
        );
    }, [games, search]);

    const activeGames = games.filter((g) => g.is_active).length;
    const inactiveGames = games.filter((g) => !g.is_active).length;

    const resetForm = () => {
        setName("");
        setMinPlayers(2);
        setMaxPlayers("");
        setIsActive(true);
        setError("");
    };

    const openNew = () => {
        setEditing(null);
        resetForm();
        setShowForm(true);
    };

    const openEdit = (game) => {
        setEditing(game);

        setName(game.name);
        setMinPlayers(game.min_players ?? 2);
        setMaxPlayers(game.max_players ?? "");
        setIsActive(game.is_active);

        setError("");
        setShowForm(true);
    };

    const closeModal = () => {
        setShowForm(false);
        setEditing(null);
        setError("");
    };

    const handleSave = async (e) => {
        e.preventDefault();

        setError("");

        const min = parseInt(minPlayers, 10);
        const max = maxPlayers === "" ? null : parseInt(maxPlayers, 10);

        if (!name.trim()) {
            return setError("Game name is required.");
        }

        if (isNaN(min) || min < 2) {
            return setError("Minimum players must be at least 2.");
        }

        if (max !== null && max < min) {
            return setError(
                "Maximum players cannot be less than minimum players."
            );
        }

        const payload = {
            name: name.trim(),
            min_players: min,
            max_players: max,
            is_active: isActive,
        };

        setSaving(true);

        try {
            if (editing) {
                await updateGame(editing.id, payload);
            } else {
                await createGame(payload);
            }

            closeModal();
            fetchGames();
        } catch (err) {
            const data = err.response?.data;

            if (data && typeof data === "object") {
                const messages = Object.entries(data)
                    .flatMap(([key, value]) =>
                        Array.isArray(value)
                            ? value.map((msg) => `${key}: ${msg}`)
                            : [`${key}: ${value}`]
                    )
                    .join(" | ");

                setError(messages);
            } else {
                setError(data ?? "Something went wrong.");
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="font-game font-bold text-3xl text-white">
                        GAME MANAGEMENT
                    </h1>

                    <p className="text-white/40 text-sm mt-1">
                        Manage available games and player limits
                    </p>
                </div>

                <button
                    onClick={openNew}
                    className="btn-cyan"
                >
                    Add Game
                </button>
            </div>

            {/* Stats */}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card-cyan text-center">
                    <p className="text-white/40 text-xs uppercase tracking-wider">
                        Total Games
                    </p>

                    <p className="font-game text-3xl text-cyan mt-2">
                        {games.length}
                    </p>
                </div>

                <div className="card-cyan text-center border-green-500/20">
                    <p className="text-white/40 text-xs uppercase tracking-wider">
                        Active
                    </p>

                    <p className="font-game text-3xl text-green-400 mt-2">
                        {activeGames}
                    </p>
                </div>

                <div className="card-cyan text-center border-red-500/20">
                    <p className="text-white/40 text-xs uppercase tracking-wider">
                        Inactive
                    </p>

                    <p className="font-game text-3xl text-red-400 mt-2">
                        {inactiveGames}
                    </p>
                </div>
            </div>

            {/* Search */}

            <div className="card-cyan">
                <input
                    className="input"
                    placeholder="Search games..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* List */}

            {loading ? (
                <Spinner/>
            ) : (
                <div className="space-y-3">
                    {filteredGames.length === 0 && (
                        <div className="card-cyan text-center py-12">
                            <p className="text-white/40">
                                No games found.
                            </p>
                        </div>
                    )}

                    {filteredGames.map((game) => (
                        <div
                            key={game.id}
                            className="card-cyan flex items-center justify-between gap-4 hover:border-cyan/40 transition-all duration-200"
                        >
                            <div className="flex items-center gap-4">
                                <div
                                    className="w-12 h-12 rounded-xl bg-cyan/10 border border-cyan/20 flex items-center justify-center">
                                    <div className="w-3 h-3 rounded-full bg-cyan"/>
                                </div>

                                <div>
                                    <h3 className="font-game font-bold text-white">
                                        {game.name}
                                    </h3>

                                    <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-cyan text-xs font-semibold">
                      {game.player_count_label} Players
                    </span>

                                        <span
                                            className={`px-2 py-1 rounded-full text-[10px] font-semibold border ${
                                                game.is_active
                                                    ? "bg-green-500/10 border-green-500/30 text-green-400"
                                                    : "bg-red-500/10 border-red-500/30 text-red-400"
                                            }`}
                                        >
                      {game.is_active ? "ACTIVE" : "INACTIVE"}
                    </span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => openEdit(game)}
                                className="btn-cyan text-xs px-4 py-2"
                            >
                                Edit
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}

            {showForm && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="card-cyan w-full max-w-md">
                        <div className="mb-6 text-center">
                            <h2 className="font-game text-xl text-white">
                                {editing ? "Edit Game" : "Create Game"}
                            </h2>

                            <p className="text-white/30 text-xs mt-1">
                                Configure player limits and availability
                            </p>
                        </div>

                        <form
                            onSubmit={handleSave}
                            className="space-y-4"
                        >
                            {error && (
                                <div
                                    className="px-4 py-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-white/60 text-xs font-game uppercase mb-2">
                                    Game Name
                                </label>

                                <input
                                    className="input"
                                    value={name}
                                    placeholder="Enter game name"
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-white/60 text-xs font-game uppercase mb-2">
                                        Min Players
                                    </label>

                                    <input
                                        type="number"
                                        min="2"
                                        className="input"
                                        value={minPlayers}
                                        onChange={(e) => setMinPlayers(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-white/60 text-xs font-game uppercase mb-2">
                                        Max Players
                                    </label>

                                    <input
                                        type="number"
                                        min={minPlayers}
                                        className="input"
                                        value={maxPlayers}
                                        placeholder="Unlimited"
                                        onChange={(e) => setMaxPlayers(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="rounded-lg bg-navy-700 border border-white/10 px-4 py-3">
                                <p className="text-white/40 text-xs mb-1">
                                    Player Count Label
                                </p>

                                <p className="text-cyan font-semibold">
                                    {maxPlayers === ""
                                        ? `${minPlayers}+`
                                        : Number(minPlayers) === Number(maxPlayers)
                                            ? `${minPlayers}`
                                            : `${minPlayers}-${maxPlayers}`}{" "}
                                    Players
                                </p>
                            </div>

                            {editing && (
                                <div
                                    className="flex items-center justify-between rounded-xl border border-white/10 bg-navy-700 p-4">
                                    <div>
                                        <p className="text-white font-medium">
                                            Game Status
                                        </p>

                                        <p className="text-white/30 text-xs">
                                            Control game visibility
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setIsActive(!isActive)}
                                        className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${
                                            isActive
                                                ? "bg-green-500/10 border-green-500/30 text-green-400"
                                                : "bg-red-500/10 border-red-500/30 text-red-400"
                                        }`}
                                    >
                                        {isActive ? "ACTIVE" : "INACTIVE"}
                                    </button>
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="btn-gold flex-1 justify-center"
                                >
                                    {saving
                                        ? "Saving..."
                                        : editing
                                            ? "Save Changes"
                                            : "Create Game"}
                                </button>

                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="btn-danger flex-1 justify-center"
                                >
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