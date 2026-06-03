import {Link} from "react-router-dom";

const RANK_STYLES = {
    1: {
        badge: "🥇",
        row: "bg-gold/5 border-gold/20",
    },
    2: {
        badge: "🥈",
        row: "bg-white/5 border-white/10",
    },
    3: {
        badge: "🥉",
        row: "bg-orange-500/10 border-orange-500/20",
    },
};

export default function LeaderboardTable({data}) {
    if (!data?.length) {
        return (
            <p className="text-white/30 text-center py-12">
                No players yet
            </p>
        );
    }

    return (
        <div className="overflow-x-auto rounded-xl border border-white/10">

            <table className="w-full border-collapse">

                {/* HEADER */}
                <thead className="bg-navy-800/50">
                <tr className="text-left border-b border-white/10">
                    <th className="px-4 py-3 text-xs uppercase tracking-wider font-game text-cyan w-16">
                        Rank
                    </th>

                    <th className="px-4 py-3 text-xs uppercase tracking-wider font-game text-cyan">
                        Player
                    </th>

                    <th className="px-4 py-3 text-xs uppercase tracking-wider font-game text-gold text-center">
                        Points
                    </th>

                    <th className="px-4 py-3 text-xs uppercase tracking-wider font-game text-purple text-center">
                        Played
                    </th>

                    <th className="px-4 py-3 text-xs uppercase tracking-wider font-game text-green-400 text-center">
                        Wins
                    </th>

                    <th className="px-4 py-3 text-xs uppercase tracking-wider font-game text-red-400 text-center">
                        Losses
                    </th>
                </tr>
                </thead>

                {/* BODY */}
                <tbody className="divide-y divide-white/5">

                {data.map((row) => {
                    const rankStyle = RANK_STYLES[row.rank];

                    return (
                        <tr
                            key={row.player_id}
                            className={`transition hover:bg-white/5 ${
                                rankStyle?.row ?? ""
                            }`}
                        >

                            {/* RANK */}
                            <td className="px-4 py-4 text-center">
                  <span className="font-game text-white/60 font-bold">
                    {rankStyle?.badge ?? `#${row.rank}`}
                  </span>
                            </td>

                            {/* PLAYER */}
                            <td className="px-4 py-4">
                                <Link
                                    to={`/players/${row.player_id}`}
                                    className="flex items-center gap-3 group"
                                >
                                    <div
                                        className="w-10 h-10 rounded-full overflow-hidden border border-white/10 group-hover:border-cyan/40 transition shrink-0">
                                        {row.photo ? (
                                            <img
                                                src={row.photo}
                                                alt={row.nickname}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div
                                                className="w-full h-full bg-navy-700 flex items-center justify-center text-white/40 font-game font-bold">
                                                {row.nickname?.[0]?.toUpperCase()}
                                            </div>
                                        )}
                                    </div>

                                    <div className="min-w-0">
                                        <p className="font-game font-semibold text-white group-hover:text-cyan transition truncate">
                                            {row.nickname}
                                        </p>
                                        <p className="text-xs text-white/30 truncate">
                                            {row.department || "No department"}
                                        </p>
                                    </div>
                                </Link>
                            </td>

                            {/* POINTS */}
                            <td className="px-4 py-4 text-center">
                  <span className="font-game font-bold text-gold text-lg">
                    {row.total_points.toLocaleString()}
                  </span>
                            </td>

                            {/* PLAYED */}
                            <td className="px-4 py-4 text-center text-purple font-game font-semibold">
                                {row.matches_played}
                            </td>

                            {/* WINS */}
                            <td className="px-4 py-4 text-center text-green-400 font-game font-semibold">
                                {row.wins}
                            </td>

                            {/* LOSSES */}
                            <td className="px-4 py-4 text-center text-red-400 font-game font-semibold">
                                {row.losses}
                            </td>

                        </tr>
                    );
                })}

                </tbody>
            </table>
        </div>
    );
}