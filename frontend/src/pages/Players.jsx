import {useState, useEffect} from "react";
import {getPlayers} from "../api/players";
import PlayerCard from "../components/players/PlayerCard";
import Spinner from "../components/common/Spinner";
import PageTitle from "../components/common/PageTitle";

export default function Players() {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        getPlayers()
            .then((r) => setPlayers(r.data.results ?? r.data))
            .finally(() => setLoading(false));
    }, []);

    const filtered = players.filter(
        (p) =>
            p.nickname.toLowerCase().includes(search.toLowerCase()) ||
            p.fullname.toLowerCase().includes(search.toLowerCase()) ||
            p.department?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <PageTitle
                title="PLAYERS"
                sub="Browse player profiles, rankings, and match activity."
            />

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <input
                    className="input max-w-sm"
                    placeholder="Search by name or department"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                {!loading && (
                    <span className="text-white/40 text-xs font-game uppercase tracking-wider">
                        {filtered.length} Players
                    </span>
                )}
            </div>

            {loading ? (
                <Spinner/>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {filtered.map((player) => (
                        <PlayerCard
                            key={player.id}
                            player={player}
                        />
                    ))}

                    {filtered.length === 0 && (
                        <div className="col-span-full py-12 text-center">
                            <p className="text-white/40 font-medium">
                                No players found
                            </p>

                            <p className="text-white/25 text-sm mt-1">
                                Try adjusting your search terms.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}