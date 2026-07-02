import {Link} from "react-router-dom";
import {useLeaderboard} from "../hooks/useLeaderboard";
import Spinner from "../components/common/Spinner";

const PODIUM_STYLES = {
    1: {
        icon: "🥇",
        label: "Champion",
        card: "border-gold/60 bg-gold/10 shadow-gold",
        accent: "text-gold text-glow-gold",
        ring: "border-gold/70",
    },
    2: {
        icon: "🥈",
        label: "Runner Up",
        card: "border-white/30 bg-white/5",
        accent: "text-white",
        ring: "border-white/50",
    },
    3: {
        icon: "🥉",
        label: "Third Place",
        card: "border-orange-500/50 bg-orange-500/10",
        accent: "text-orange-400",
        ring: "border-orange-400/60",
    },
};

function PlayerAvatar({player, size = "md", className = ""}) {
    const sizes = {
        sm: "w-10 h-10 text-sm",
        md: "w-16 h-16 text-xl",
        lg: "w-24 h-24 text-3xl",
    };

    return (
        <div
            className={`${sizes[size]} rounded-full overflow-hidden border-2 bg-navy-700 flex items-center justify-center shrink-0 ${className}`}
        >
            {player.photo ? (
                <img
                    src={player.photo}
                    alt={player.nickname}
                    className="w-full h-full object-cover"
                />
            ) : (
                <span className="font-game font-bold text-white/50">
                    {player.nickname?.[0]?.toUpperCase() ?? "?"}
                </span>
            )}
        </div>
    );
}

export default function Home() {
    const {data: leaderboard, loading} = useLeaderboard();

    const activeLeaderboard = leaderboard
        .filter(
            (player) =>
                player.total_points > 0 ||
                player.matches_played > 0 ||
                player.wins > 0 ||
                player.losses > 0
        )
        .slice(0, 20);

    const topThree = activeLeaderboard.slice(0, 3);
    const restOfTopTwenty = activeLeaderboard.slice(3, 20);

    const totalPlayers = activeLeaderboard.length;
    const totalPoints = activeLeaderboard.reduce(
        (sum, player) => sum + Number(player.total_points || 0),
        0
    );
    const totalMatches = activeLeaderboard.reduce(
        (sum, player) => sum + Number(player.matches_played || 0),
        0
    );

    return (
        <div className="space-y-12">
            {/* Thank You Hero */}
            <section
                className="relative overflow-hidden rounded-2xl border border-cyan/30 bg-navy-800 p-8 md:p-12 text-center">
                <div
                    className="absolute inset-0 bg-gradient-to-br from-cyan/10 via-transparent to-gold/10 pointer-events-none"/>
                <div
                    className="absolute -top-24 -left-24 w-72 h-72 bg-cyan/10 blur-[90px] rounded-full pointer-events-none"/>
                <div
                    className="absolute -bottom-24 -right-24 w-72 h-72 bg-gold/10 blur-[90px] rounded-full pointer-events-none"/>

                <div className="relative z-10 max-w-4xl mx-auto">
                    <p className="font-game text-cyan text-sm md:text-base uppercase tracking-[0.35em] mb-4">
                        WerksPlay Season Appreciation
                    </p>

                    <h1 className="font-game font-bold text-4xl md:text-7xl text-white uppercase leading-tight">
                        Thank You,{" "}
                        <span className="text-cyan text-glow-cyan">
                            Players
                        </span>
                    </h1>

                    <p className="mt-5 text-white/60 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
                        Huge thanks to every member who participated, submitted matches,
                        completed side quests, and kept the competition alive. Your energy
                        made the leaderboard worth watching.
                    </p>

                    <div className="mt-8 flex flex-wrap justify-center gap-3">
                        <Link to="/leaderboard" className="btn-gold">
                            View Full Leaderboard
                        </Link>

                        <Link to="/players" className="btn-cyan">
                            Browse Players
                        </Link>
                    </div>
                </div>
            </section>

            {/* Season Snapshot */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="card-cyan text-center">
                    <p className="text-white/40 text-xs uppercase tracking-widest">
                        Featured Players
                    </p>
                    <p className="font-game text-4xl text-cyan mt-2">
                        {loading ? "—" : totalPlayers}
                    </p>
                </div>

                <div className="card-cyan text-center border-gold/30">
                    <p className="text-white/40 text-xs uppercase tracking-widest">
                        Total Points
                    </p>
                    <p className="font-game text-4xl text-gold mt-2">
                        {loading ? "—" : totalPoints.toLocaleString()}
                    </p>
                </div>

                <div className="card-cyan text-center border-purple/30">
                    <p className="text-white/40 text-xs uppercase tracking-widest">
                        Matches Played
                    </p>
                    <p className="font-game text-4xl text-purple mt-2">
                        {loading ? "—" : totalMatches.toLocaleString()}
                    </p>
                </div>
            </section>

            {/* Top 3 Highlight */}
            <section>
                <div className="text-center mb-7">
                    <p className="font-game text-gold text-sm uppercase tracking-[0.3em]">
                        Hall of Fame
                    </p>

                    <h2 className="font-game font-bold text-3xl md:text-4xl text-white uppercase mt-2">
                        Top 3 Champions
                    </h2>

                    <p className="text-white/40 text-sm mt-2">
                        Special recognition for the strongest finishers on the board.
                    </p>
                </div>

                {loading ? (
                    <Spinner/>
                ) : topThree.length === 0 ? (
                    <div className="card-cyan text-center py-12">
                        <p className="text-white/40">
                            No leaderboard results available yet.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {topThree.map((player) => {
                            const style = PODIUM_STYLES[player.rank] ?? PODIUM_STYLES[3];

                            return (
                                <Link
                                    key={player.player_id}
                                    to={`/players/${player.player_id}`}
                                    className={`card text-center transition-all duration-200 hover:-translate-y-1 hover:scale-[1.01] ${style.card}`}
                                >
                                    <div className="text-5xl mb-3">
                                        {style.icon}
                                    </div>

                                    <p className={`font-game font-bold uppercase tracking-widest text-sm ${style.accent}`}>
                                        {style.label}
                                    </p>

                                    <div className="mt-5 flex justify-center">
                                        <PlayerAvatar
                                            player={player}
                                            size="lg"
                                            className={style.ring}
                                        />
                                    </div>

                                    <h3 className="font-game font-bold text-2xl text-white mt-4 truncate">
                                        {player.nickname}
                                    </h3>

                                    <p className="text-white/35 text-xs mt-1 truncate">
                                        {player.department || "No department"}
                                    </p>

                                    <div className="mt-5">
                                        <p className={`font-game font-bold text-4xl ${style.accent}`}>
                                            {player.total_points.toLocaleString()}
                                        </p>

                                        <p className="text-white/40 text-xs uppercase tracking-widest">
                                            Points
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 mt-5 text-xs">
                                        <div className="rounded-lg bg-navy-700/70 border border-white/5 py-2">
                                            <p className="text-purple font-game font-bold">
                                                {player.matches_played}
                                            </p>
                                            <p className="text-white/30">Played</p>
                                        </div>

                                        <div className="rounded-lg bg-navy-700/70 border border-white/5 py-2">
                                            <p className="text-green-400 font-game font-bold">
                                                {player.wins}
                                            </p>
                                            <p className="text-white/30">Wins</p>
                                        </div>

                                        <div className="rounded-lg bg-navy-700/70 border border-white/5 py-2">
                                            <p className="text-red-400 font-game font-bold">
                                                {player.losses}
                                            </p>
                                            <p className="text-white/30">Losses</p>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Top 20 Leaderboard */}
            <section className="card-cyan">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6">
                    <div>
                        <p className="font-game text-cyan text-xs uppercase tracking-[0.25em]">
                            Final Standings
                        </p>

                        <h2 className="font-game font-bold text-2xl md:text-3xl text-white uppercase mt-1">
                            Top 20 Leaderboard
                        </h2>

                        <p className="text-white/40 text-sm mt-1">
                            Celebrating the members who climbed the rankings.
                        </p>
                    </div>

                    <Link
                        to="/leaderboard"
                        className="text-cyan text-xs uppercase tracking-wider hover:underline"
                    >
                        See Complete Rankings →
                    </Link>
                </div>

                {loading ? (
                    <Spinner/>
                ) : activeLeaderboard.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-white/40">
                            No leaderboard entries available yet.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {restOfTopTwenty.length > 0 && (
                            <div
                                className="hidden md:grid grid-cols-[80px_1fr_120px_100px_100px] gap-4 px-4 pb-2 text-xs font-game uppercase tracking-wider text-white/30">
                                <span>Rank</span>
                                <span>Player</span>
                                <span className="text-right">Points</span>
                                <span className="text-right">Wins</span>
                                <span className="text-right">Played</span>
                            </div>
                        )}

                        {activeLeaderboard.map((player) => {
                            const isTopThree = player.rank <= 3;
                            const podiumStyle = PODIUM_STYLES[player.rank];

                            return (
                                <Link
                                    key={player.player_id}
                                    to={`/players/${player.player_id}`}
                                    className={`grid grid-cols-[auto_1fr] md:grid-cols-[80px_1fr_120px_100px_100px] items-center gap-4 rounded-xl border px-4 py-4 transition-all duration-200 hover:bg-white/[0.04] ${
                                        isTopThree
                                            ? podiumStyle.card
                                            : "border-white/10 bg-navy-700/50"
                                    }`}
                                >
                                    <div className="flex items-center justify-center">
                                        <span
                                            className={`font-game font-bold ${
                                                isTopThree
                                                    ? "text-2xl"
                                                    : "text-white/50"
                                            }`}
                                        >
                                            {isTopThree ? podiumStyle.icon : `#${player.rank}`}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-3 min-w-0">
                                        <PlayerAvatar
                                            player={player}
                                            size="sm"
                                            className={
                                                isTopThree
                                                    ? podiumStyle.ring
                                                    : "border-white/10"
                                            }
                                        />

                                        <div className="min-w-0">
                                            <p className="font-game font-bold text-white truncate">
                                                {player.nickname}
                                            </p>

                                            <p className="text-white/30 text-xs truncate">
                                                {player.department || "No department"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="col-span-2 md:col-span-1 md:text-right">
                                        <p className="font-game font-bold text-gold text-lg">
                                            {player.total_points.toLocaleString()}
                                        </p>
                                        <p className="md:hidden text-white/30 text-xs">
                                            Points
                                        </p>
                                    </div>

                                    <div className="hidden md:block text-right">
                                        <p className="font-game font-semibold text-green-400">
                                            {player.wins}
                                        </p>
                                    </div>

                                    <div className="hidden md:block text-right">
                                        <p className="font-game font-semibold text-purple">
                                            {player.matches_played}
                                        </p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Closing Thanks */}
            <section className="rounded-2xl border border-purple/30 bg-purple/5 p-6 md:p-8 text-center">
                <h2 className="font-game font-bold text-2xl text-white uppercase">
                    To Every Participant: Thank You
                </h2>

                <p className="text-white/50 text-sm md:text-base mt-3 max-w-3xl mx-auto leading-relaxed">
                    Whether you topped the leaderboard, joined a few matches, submitted
                    results, or cheered others on — you helped make WerksPlay fun,
                    competitive, and memorable.
                </p>

                <p className="font-game text-purple text-lg mt-5">
                    GGWP, everyone. 🎮
                </p>
            </section>
        </div>
    );
}