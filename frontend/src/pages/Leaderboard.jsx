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

    return (
        <div>
            <PageTitle
                title="LEADERBOARD"
                sub="Rankings update automatically after approved match results."
            />

            {pulse && (
                <div
                    className="mb-4 px-4 py-2 rounded-lg bg-cyan/10 border border-cyan/30 text-cyan text-sm font-medium animate-pulse">
                    Leaderboard updated
                </div>
            )}

            <div className="card-cyan">
                <div className="flex items-center justify-between mb-6">
                    <span className="text-white/40 text-xs font-game uppercase tracking-wider">
                        All-Time Standings
                    </span>
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