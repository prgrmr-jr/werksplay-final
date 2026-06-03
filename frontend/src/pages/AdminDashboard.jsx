import {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {getMatches} from "../api/matches";
import {getSideQuests} from "../api/sidequests";
import {getPlayers} from "../api/players";

import StatCard from "../components/common/StatCard";
import Spinner from "../components/common/Spinner";

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchAll = async () => {
        try {
            setLoading(true);

            const [
                pendingMatches,
                pendingQuests,
                completionPending,
                allMatches,
                players,
            ] = await Promise.all([
                getMatches("Pending"),
                getSideQuests("Pending"),
                getSideQuests("Completion Pending"),
                getMatches(),
                getPlayers(),
            ]);

            setStats({
                pendingMatches:
                (pendingMatches.data.results ?? pendingMatches.data).length,

                pendingQuests:
                (pendingQuests.data.results ?? pendingQuests.data).length,

                completionPending:
                (completionPending.data.results ?? completionPending.data).length,

                totalMatches:
                (allMatches.data.results ?? allMatches.data).length,

                totalPlayers:
                (players.data.results ?? players.data).length,
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    if (loading || !stats) return <Spinner/>;

    const totalPending =
        stats.pendingMatches +
        stats.pendingQuests +
        stats.completionPending;

    return (
        <div className="space-y-8">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                    <h1 className="font-game text-3xl font-bold text-white uppercase">
                        Admin Dashboard
                    </h1>
                    <p className="text-white/40 text-sm mt-2 max-w-xl">
                        Overview of moderation activity, submissions, and platform usage.
                    </p>
                </div>

                <button onClick={fetchAll} className="btn-cyan">
                    Refresh
                </button>
            </div>

            {/* Alert Bar */}
            {totalPending > 0 && (
                <div
                    className="rounded-xl border border-gold/30 bg-gold/5 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                        <p className="text-gold font-game font-bold">
                            {totalPending} items pending review
                        </p>
                        <p className="text-white/40 text-sm">
                            Moderation queue requires attention
                        </p>
                    </div>

                    <Link to="/admin/matches" className="btn-gold">
                        Open Queue
                    </Link>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
                <StatCard label="Matches" value={stats.pendingMatches} color="gold"/>
                <StatCard label="Quests" value={stats.pendingQuests} color="purple"/>
                <StatCard label="Review" value={stats.completionPending} color="cyan"/>
                <StatCard label="Total Matches" value={stats.totalMatches} color="cyan"/>
                <StatCard label="Players" value={stats.totalPlayers} color="green"/>
            </div>
            {/* Summary */}
            <div className="rounded-xl border border-white/10 bg-navy-800 p-6">
                <h2 className="font-game text-white font-bold mb-4 uppercase">
                    Summary
                </h2>

                <div className="grid grid-cols-3 gap-6 text-center">

                    <div>
                        <p className="text-white/30 text-xs uppercase">Players</p>
                        <p className="text-3xl font-bold text-green">
                            {stats.totalPlayers}
                        </p>
                    </div>

                    <div>
                        <p className="text-white/30 text-xs uppercase">Matches</p>
                        <p className="text-3xl font-bold text-cyan">
                            {stats.totalMatches}
                        </p>
                    </div>

                    <div>
                        <p className="text-white/30 text-xs uppercase">Pending</p>
                        <p className="text-3xl font-bold text-gold">
                            {totalPending}
                        </p>
                    </div>

                </div>
            </div>

        </div>
    );
}