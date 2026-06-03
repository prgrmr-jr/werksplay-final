import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {getPlayerProfile} from "../api/players";

import Spinner from "../components/common/Spinner";
import StatCard from "../components/common/StatCard";
import MatchCard from "../components/matches/MatchCard";
import SideQuestCard from "../components/sidequests/SideQuestCard";

export default function PlayerProfile() {
    const {id} = useParams();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState("overview");

    useEffect(() => {
        setLoading(true);
        getPlayerProfile(id)
            .then((r) => setData(r.data))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <Spinner size="lg"/>;
    if (!data)
        return (
            <p className="text-white/30 text-center py-20">
                Player not found
            </p>
        );

    const {player, stats, recent_matches, side_quests, timeline} = data;

    const TABS = ["overview", "matches", "sidequests", "timeline"];

    return (
        <div className="space-y-8">

            {/* HEADER */}
            <div className="card-cyan flex flex-col sm:flex-row gap-6 items-start sm:items-center">

                {/* Avatar */}
                <div className="w-24 h-24 rounded-full overflow-hidden border border-cyan/30 shrink-0">
                    {player.photo ? (
                        <img
                            src={player.photo}
                            className="w-full h-full object-cover"
                            alt={player.nickname}
                        />
                    ) : (
                        <div
                            className="w-full h-full flex items-center justify-center text-cyan font-game font-bold text-2xl">
                            {player.nickname?.[0]?.toUpperCase()}
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 space-y-1">
                    <h1 className="font-game font-bold text-2xl text-white uppercase tracking-wider">
                        {player.nickname}
                    </h1>

                    <p className="text-white/40 text-sm">{player.fullname}</p>

                    {player.department && (
                        <span
                            className="inline-block px-3 py-1 rounded-full bg-purple/10 border border-purple/20 text-purple text-xs">
              {player.department}
            </span>
                    )}

                    {player.bio && (
                        <p className="text-white/60 text-sm max-w-xl mt-2">
                            {player.bio}
                        </p>
                    )}
                </div>

                {/* Points */}
                <div className="shrink-0 text-right">
                    <div className="text-gold font-game font-bold text-3xl">
                        {stats.total_points.toLocaleString()}
                    </div>
                    <div className="text-white/30 text-xs uppercase tracking-wider">
                        Total Points
                    </div>
                </div>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                <StatCard label="Matches" value={stats.matches_played} color="purple"/>
                <StatCard label="Wins" value={stats.wins} color="green"/>
                <StatCard label="Losses" value={stats.losses} color="red"/>
                <StatCard label="Win Rate" value={`${stats.win_rate}%`} color="cyan"/>
                <StatCard label="Quests" value={stats.quests_completed} color="gold"/>
                <StatCard label="Points" value={stats.total_points} color="gold"/>
            </div>

            {/* TABS */}
            <div className="flex flex-wrap gap-2">
                {TABS.map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-4 py-2 rounded-lg text-xs font-game uppercase tracking-wider border transition ${
                            tab === t
                                ? "bg-cyan/10 text-cyan border-cyan/30"
                                : "text-white/40 border-white/10 hover:text-white"
                        }`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {/* CONTENT */}
            {tab === "overview" && (
                <div className="grid md:grid-cols-2 gap-6">

                    <div className="card-cyan">
                        <h3 className="text-sm font-game uppercase text-white/70 mb-4">
                            Most Played With
                        </h3>

                        {stats.most_played_with.length === 0 ? (
                            <p className="text-white/30 text-sm">No data available</p>
                        ) : (
                            stats.most_played_with.map((p, i) => (
                                <div
                                    key={p.player__id}
                                    className="flex justify-between py-2 border-b border-white/5 last:border-0"
                                >
                  <span className="text-white/70 text-sm">
                    {i + 1}. {p.player__nickname}
                  </span>
                                    <span className="text-cyan text-xs">
                    {p.games_together}
                  </span>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="card-cyan">
                        <h3 className="text-sm font-game uppercase text-white/70 mb-4">
                            Most Played Games
                        </h3>

                        {stats.most_played_games.length === 0 ? (
                            <p className="text-white/30 text-sm">No data available</p>
                        ) : (
                            stats.most_played_games.map((g, i) => (
                                <div
                                    key={g.match__game__name}
                                    className="flex justify-between py-2 border-b border-white/5 last:border-0"
                                >
                  <span className="text-white/70 text-sm">
                    {i + 1}. {g.match__game__name}
                  </span>
                                    <span className="text-purple text-xs">
                    {g.count}
                  </span>
                                </div>
                            ))
                        )}
                    </div>

                </div>
            )}

            {tab === "matches" && (
                <div className="grid md:grid-cols-2 gap-4">
                    {recent_matches.length === 0 ? (
                        <p className="text-white/30 text-sm">No matches found</p>
                    ) : (
                        recent_matches.map((m) => (
                            <MatchCard key={m.id} match={m}/>
                        ))
                    )}
                </div>
            )}

            {tab === "sidequests" && (
                <div className="grid md:grid-cols-2 gap-4">
                    {side_quests.length === 0 ? (
                        <p className="text-white/30 text-sm">No side quests found</p>
                    ) : (
                        side_quests.map((q) => (
                            <SideQuestCard key={q.id} quest={q}/>
                        ))
                    )}
                </div>
            )}

            {tab === "timeline" && (
                <div className="card-cyan divide-y divide-white/5">
                    {timeline.length === 0 ? (
                        <p className="text-white/30 text-sm">No activity yet</p>
                    ) : (
                        timeline.map((entry, i) => (
                            <div key={i} className="flex items-center justify-between py-3">
                                <div className="text-white/40 text-xs w-28">
                                    {new Date(entry.date).toLocaleDateString("en-PH", {
                                        month: "short",
                                        day: "numeric",
                                    })}
                                </div>

                                <div className="flex-1 text-white/70 text-sm">
                                    {entry.label}
                                </div>

                                <div
                                    className={`text-sm font-game ${
                                        entry.points > 0 ? "text-gold" : "text-red-400"
                                    }`}
                                >
                                    {entry.points > 0 ? "+" : ""}
                                    {entry.points}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

        </div>
    );
}