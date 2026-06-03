import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {getMatch} from "../api/matches";

import StatusBadge from "../components/common/StatusBadge";
import CommentSection from "../components/comments/CommentSection";
import Spinner from "../components/common/Spinner";

export default function MatchDetail() {
    const {id} = useParams();
    const [match, setMatch] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getMatch(id)
            .then((r) => setMatch(r.data))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <Spinner size="lg"/>;
    if (!match)
        return (
            <p className="text-white/30 text-center py-20">
                Match not found.
            </p>
        );

    const winners =
        match.participants?.filter((p) => p.is_winner) ?? [];
    const others =
        match.participants?.filter((p) => !p.is_winner) ?? [];

    return (
        <div className="max-w-3xl mx-auto space-y-6">

            {/* HEADER */}
            <div className="card-cyan space-y-4">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="font-game font-bold text-2xl text-white uppercase">
                            MATCH DETAILS
                        </h1>
                        <p className="text-white/40 text-sm mt-1">
                            {match.game_detail?.name}
                        </p>
                    </div>

                    <StatusBadge status={match.status}/>
                </div>

                {/* PROOF */}
                {match.proof_image && (
                    <div className="rounded-lg overflow-hidden border border-white/10">
                        <img
                            src={match.proof_image}
                            alt="Proof"
                            className="w-full max-h-80 object-cover"
                        />
                    </div>
                )}

                {/* PARTICIPANTS */}
                <div className="grid md:grid-cols-2 gap-4">

                    {/* Winners */}
                    <div className="bg-navy-700 rounded-lg p-4">
                        <p className="text-xs text-gold font-game uppercase tracking-wider mb-3">
                            Winners
                        </p>

                        {winners.length === 0 ? (
                            <p className="text-white/30 text-sm">None</p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {winners.map((p) => (
                                    <span
                                        key={p.id}
                                        className="px-3 py-1 rounded-md bg-gold/10 border border-gold/30 text-gold text-sm"
                                    >
                    {p.player_detail?.nickname}
                  </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Others */}
                    <div className="bg-navy-700 rounded-lg p-4">
                        <p className="text-xs text-white/40 font-game uppercase tracking-wider mb-3">
                            Participants
                        </p>

                        {others.length === 0 ? (
                            <p className="text-white/30 text-sm">None</p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {others.map((p) => (
                                    <span
                                        key={p.id}
                                        className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-white/60 text-sm"
                                    >
                    {p.player_detail?.nickname}
                  </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* META */}
                <div className="grid md:grid-cols-3 gap-3 text-sm">

                    <div className="bg-navy-700 rounded-lg p-3">
                        <p className="text-white/30 text-xs uppercase">
                            Submitted By
                        </p>
                        <p className="text-white/80 mt-1">
                            {match.submitted_by_name}
                        </p>
                    </div>

                    <div className="bg-navy-700 rounded-lg p-3">
                        <p className="text-white/30 text-xs uppercase">
                            Submitted At
                        </p>
                        <p className="text-white/80 mt-1">
                            {new Date(match.submitted_at).toLocaleString(
                                "en-PH",
                                {dateStyle: "medium", timeStyle: "short"}
                            )}
                        </p>
                    </div>

                    {match.approved_at && (
                        <div className="bg-navy-700 rounded-lg p-3">
                            <p className="text-white/30 text-xs uppercase">
                                Approved At
                            </p>
                            <p className="text-white/80 mt-1">
                                {new Date(match.approved_at).toLocaleString(
                                    "en-PH",
                                    {dateStyle: "medium", timeStyle: "short"}
                                )}
                            </p>
                        </div>
                    )}
                </div>

                {/* NOTES */}
                {match.notes && (
                    <div className="bg-navy-700 rounded-lg p-3">
                        <p className="text-white/30 text-xs uppercase mb-1">
                            Notes
                        </p>
                        <p className="text-white/70 text-sm">
                            {match.notes}
                        </p>
                    </div>
                )}
            </div>

            {/* COMMENTS */}
            <div className="card-cyan">
                <CommentSection model="match" objectId={match.id}/>
            </div>
        </div>
    );
}