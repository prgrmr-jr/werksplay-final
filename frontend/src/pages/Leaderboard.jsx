import {useEffect, useState} from "react";
import {useLeaderboard} from "../hooks/useLeaderboard";
import {useNotifications} from "../websocket/NotificationContext";

import LeaderboardTable from "../components/leaderboard/LeaderboardTable";
import Spinner from "../components/common/Spinner";
import PageTitle from "../components/common/PageTitle";

export default function Leaderboard() {
    const {data, loading} = useLeaderboard();
    const {lastEvent} = useNotifications();

    const [pulse, setPulse] = useState(false);

    useEffect(() => {
        if (lastEvent?.event === "leaderboard_updated") {
            setPulse(true);

            const timer = setTimeout(() => {
                setPulse(false);
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [lastEvent]);

    const leader = data?.[0];

    return (
        <div className="space-y-5">

            <PageTitle
                title="LEADERBOARD"
                sub="Rankings automatically update after approved match results."
            />

            {pulse && (
                <div
                    className="rounded-xl border border-cyan/30 bg-cyan/10 px-4 py-3 text-sm font-medium text-cyan animate-pulse">
                    🏆 Leaderboard updated
                </div>
            )}

            {!loading && data?.length > 0 && (
                <div className="grid grid-cols-3 gap-3">

                    <div className="card-cyan text-center py-4">
                        <p className="text-[10px] uppercase tracking-wider text-white/40">
                            Players
                        </p>

                        <p className="font-game text-xl md:text-2xl text-white mt-1">
                            {data.length}
                        </p>
                    </div>

                    <div className="card-cyan text-center py-4">
                        <p className="text-[10px] uppercase tracking-wider text-white/40">
                            Leading
                        </p>

                        <p className="font-game text-sm md:text-base truncate mt-1">
                            {leader?.nickname}
                        </p>
                    </div>

                    <div className="card-cyan text-center py-4">
                        <p className="text-[10px] uppercase tracking-wider text-white/40">
                            Top Score
                        </p>

                        <p className="font-game text-gold text-xl md:text-2xl mt-1">
                            {leader?.total_points?.toLocaleString()}
                        </p>
                    </div>

                </div>
            )}

            <div className="card-cyan">

                <div className="flex items-center justify-between mb-6">
                    <div>
                        <p className="text-white/40 text-xs uppercase tracking-wider font-game">
                            All-Time Standings
                        </p>

                        <p className="text-white/25 text-xs mt-1">
                            Ranked by total accumulated points
                        </p>
                    </div>

                    {!loading && (
                        <div className="text-right">
                            <p className="text-white/40 text-xs">
                                Total Players
                            </p>

                            <p className="font-game text-cyan">
                                {data?.length || 0}
                            </p>
                        </div>
                    )}
                </div>

                {loading ? (
                    <Spinner/>
                ) : (
                    <LeaderboardTable data={data}/>
                )}
            </div>

        </div>
    );
}