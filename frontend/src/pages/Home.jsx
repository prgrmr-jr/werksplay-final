import {Link} from "react-router-dom";
import {useLeaderboard} from "../hooks/useLeaderboard";
import {useMatches} from "../hooks/useMatches";
import {useSideQuests} from "../hooks/useSideQuests";
import Spinner from "../components/common/Spinner";
import MatchCard from "../components/matches/MatchCard";
import SideQuestCard from "../components/sidequests/SideQuestCard";

export default function Home() {
    const {data: lb, loading: lbLoading} = useLeaderboard();
    const {data: matches, loading: mLoad} = useMatches("Approved");
    const {data: quests, loading: qLoad} = useSideQuests();

    const top3 = lb.slice(0, 3);
    const latest3m = matches.slice(0, 3);
    const latest3q = quests.slice(0, 3);

    return (
        <div className="space-y-14">
            {/* Hero */}
            <section className="text-center py-10">
                <h1 className="font-game font-bold text-4xl md:text-6xl text-white mb-2">
                    WERKS <span className="text-cyan text-glow-cyan">PLAY</span>
                </h1>

                <h2 className="font-game font-bold text-2xl md:text-3xl text-gold text-glow-gold mb-4">
                    LEADERBOARD
                </h2>

                <p className="text-white/50 text-sm tracking-[0.2em] uppercase mb-8">
                    Track rankings, match results, and achievements.
                </p>

                <div className="flex flex-wrap justify-center gap-3">
                    <Link to="/submit-match" className="btn-gold">
                        Submit Match
                    </Link>

                    <Link to="/submit-sidequest" className="btn-cyan">
                        Submit Side Quest
                    </Link>

                    <Link to="/leaderboard" className="btn-purple">
                        View Leaderboard
                    </Link>
                </div>
            </section>

            {/* Top Rankings */}
            <section>
                <h2 className="font-game font-bold text-xl text-white uppercase tracking-wider mb-5">
                    <span className="text-cyan">Top Rankings</span>
                </h2>

                {lbLoading ? (
                    <Spinner/>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {top3.map((row) => (
                            <Link
                                key={row.player_id}
                                to={`/players/${row.player_id}`}
                                className={`card border text-center hover:scale-[1.02] transition-all duration-200 ${
                                    row.rank === 1
                                        ? "border-gold/40 bg-gold/5"
                                        : row.rank === 2
                                            ? "border-white/20 bg-white/5"
                                            : "border-orange-500/30 bg-orange-900/10"
                                }`}
                            >
                                <div className="font-game text-white/40 text-xs tracking-widest mb-3">
                                    RANK #{row.rank}
                                </div>

                                <div
                                    className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/20 mx-auto mb-3">
                                    {row.photo ? (
                                        <img
                                            src={row.photo}
                                            alt={row.nickname}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div
                                            className="w-full h-full bg-navy-600 flex items-center justify-center text-white/40 font-bold font-game text-xl">
                                            {row.nickname?.[0]}
                                        </div>
                                    )}
                                </div>

                                <div className="font-game font-bold text-white text-lg">
                                    {row.nickname}
                                </div>

                                <div className="text-gold font-game font-bold text-2xl text-glow-gold mt-1">
                                    {row.total_points.toLocaleString()}
                                </div>

                                <div className="text-white/40 text-xs uppercase tracking-widest mt-1">
                                    Points
                                </div>

                                <div className="flex justify-center gap-4 mt-3 text-xs">
                                    <span className="text-green-400">
                                        W: {row.wins}
                                    </span>

                                    <span className="text-red-400">
                                        L: {row.losses}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            {/* Recent Matches */}
            <section>
                <div className="flex items-center justify-between mb-5">
                    <h2 className="font-game font-bold text-xl text-white uppercase tracking-wider">
                        <span className="text-cyan">Recent Matches</span>
                    </h2>

                    <Link
                        to="/matches"
                        className="text-cyan text-xs uppercase tracking-wider hover:underline"
                    >
                        View All
                    </Link>
                </div>

                {mLoad ? (
                    <Spinner/>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {latest3m.map((m) => (
                            <MatchCard key={m.id} match={m}/>
                        ))}
                    </div>
                )}
            </section>

            {/* Side Quests */}
            <section>
                <div className="flex items-center justify-between mb-5">
                    <h2 className="font-game font-bold text-xl text-white uppercase tracking-wider">
                        <span className="text-purple">Side Quests</span>
                    </h2>

                    <Link
                        to="/sidequests"
                        className="text-purple text-xs uppercase tracking-wider hover:underline"
                    >
                        View All
                    </Link>
                </div>

                {qLoad ? (
                    <Spinner/>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {latest3q.map((q) => (
                            <SideQuestCard key={q.id} quest={q}/>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}