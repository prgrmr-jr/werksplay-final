import {useEffect, useState} from "react";
import {getGames} from "../api/games";

export default function Games() {
    const [games, setGames] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fallbackGames = [
        {name: "Chess", min: 2, max: 2},
        {name: "Majhong", min: 4, max: 4},
        {name: "Checkers", min: 2, max: 2},
        {name: "Tong-Its", min: 3, max: 3},
        {name: "Codenames", min: 2, max: 10},
        {name: "Poetry For Neanderthals", min: 2, max: 20},
        {name: "Taboo", min: 4, max: 12},
        {name: "Mario Kart 8 Deluxe", min: 2, max: 12},
        {name: "Dota 2", min: 10, max: 10},
        {name: "Mobile Legends", min: 10, max: 10},
        {name: "Valorant", min: 10, max: 10},
        {name: "Call of Duty (Free For All)", min: 5, max: 50},
        {name: "Pokemon Unite", min: 10, max: 10},
    ];

    useEffect(() => {
        let mounted = true;

        async function loadGames() {
            setLoading(true);
            setError(null);

            try {
                const res = await getGames();
                const payload = res?.data ?? res;

                // support array responses or paginated objects like { results: [...] }
                const rawList = Array.isArray(payload) ? payload : (payload.results || payload.items || payload.data || []);
                const normalized = (rawList || []).map((g) => ({
                    name: g.name || g.title || g.game || "Unknown",
                    min: g.min_players ?? g.min ?? 1,
                    max: g.max_players ?? g.max ?? g.players ?? 1,
                }));

                if (mounted) {
                    setGames(normalized.length ? normalized : fallbackGames);
                }
            } catch (err) {
                if (mounted) {
                    console.error("Games API error:", err);
                    setError(err.message || "Unable to load games");
                    setGames(fallbackGames);
                }
            } finally {
                if (mounted) setLoading(false);
            }
        }

        loadGames();
        return () => {
            mounted = false;
        };
    }, []);

    if (loading) {
        return (
            <div className="space-y-8">
                <div>
                    <h1 className="font-game font-bold text-3xl text-white uppercase">
                        GAMES AVAILABLE
                    </h1>
                    <p className="text-white/40 text-sm mt-1">
                        Supported games for leaderboard submissions
                    </p>
                </div>
                <div className="text-white/60">Loading games...</div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="font-game font-bold text-3xl text-white uppercase">
                    GAMES AVAILABLE
                </h1>

                <p className="text-white/40 text-sm mt-1">
                    Supported games for leaderboard submissions
                </p>
                {error && <p className="text-red-400 text-sm mt-2">Error: {error}</p>}
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                {(games || []).map((game) => (
                    <div key={game.name} className="card-cyan">
                        <h2 className="font-game text-lg text-white mb-4">{game.name}</h2>

                        <div className="flex justify-between text-sm">
                            <div>
                                <p className="text-white/30 uppercase text-xs">Min Players</p>
                                <p className="text-cyan font-bold text-xl">{game.min}</p>
                            </div>

                            <div className="text-right">
                                <p className="text-white/30 uppercase text-xs">Max Players</p>
                                <p className="text-gold font-bold text-xl">{game.max}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}