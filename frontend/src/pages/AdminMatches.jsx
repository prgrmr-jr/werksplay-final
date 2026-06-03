import {useState} from "react";
import {Link} from "react-router-dom";
import {useMatches} from "../hooks/useMatches";
import {approveMatch, declineMatch} from "../api/matches";
import StatusBadge from "../components/common/StatusBadge";
import FilterTabs from "../components/common/FilterTabs";
import Spinner from "../components/common/Spinner";

const FILTERS = [
    {label: "All", value: ""},
    {label: "Pending", value: "Pending"},
    {label: "Approved", value: "Approved"},
    {label: "Declined", value: "Declined"},
];

function parseError(err) {
    const data = err?.response?.data;

    if (!data) return "Something went wrong.";
    if (typeof data === "string") return data;
    if (data.detail) return data.detail;
    if (Array.isArray(data)) return data.join(" ");

    return Object.entries(data)
        .flatMap(([, value]) => (Array.isArray(value) ? value : [value]))
        .join(" ");
}

export default function AdminMatches() {
    const [filter, setFilter] = useState("Pending");
    const {data, loading, refresh} = useMatches(filter);

    const [busy, setBusy] = useState(null);
    const [errorMap, setErrorMap] = useState({});

    const setMatchError = (id, message) =>
        setErrorMap((prev) => ({...prev, [id]: message}));

    const clearMatchError = (id) =>
        setErrorMap((prev) => {
            const copy = {...prev};
            delete copy[id];
            return copy;
        });

    const handleApprove = async (id) => {
        clearMatchError(id);
        setBusy(id);

        try {
            await approveMatch(id);
            refresh();
        } catch (err) {
            setMatchError(id, parseError(err));
        } finally {
            setBusy(null);
        }
    };

    const handleDecline = async (id) => {
        clearMatchError(id);
        setBusy(id);

        try {
            await declineMatch(id);
            refresh();
        } catch (err) {
            setMatchError(id, parseError(err));
        } finally {
            setBusy(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="font-game font-bold text-3xl text-white uppercase tracking-wider">
                    Match Moderation
                </h1>
                <p className="text-white/40 text-sm mt-1">
                    Review and manage submitted match records.
                </p>
            </div>

            {/* Filters */}
            <FilterTabs
                options={FILTERS}
                active={filter}
                onChange={setFilter}
            />

            {/* Content */}
            {loading ? (
                <Spinner/>
            ) : data.length === 0 ? (
                <div className="card text-center py-12">
                    <p className="text-white/40">
                        No matches found.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {data.map((match) => {
                        const winners =
                            match.participants?.filter((p) => p.is_winner) ?? [];

                        const participants =
                            match.participants?.filter((p) => !p.is_winner) ?? [];

                        const error = errorMap[match.id];

                        return (
                            <div
                                key={match.id}
                                className="card-cyan"
                            >
                                {/* Error */}
                                {error && (
                                    <div
                                        className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 flex items-start gap-3">
                                        <span className="flex-1">{error}</span>

                                        <button
                                            onClick={() => clearMatchError(match.id)}
                                            className="text-red-300 hover:text-red-100"
                                        >
                                            ×
                                        </button>
                                    </div>
                                )}

                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                                    {/* Left */}
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-3 mb-3">
                                            <h2 className="font-game font-bold text-cyan text-lg">
                                                {match.game_detail?.name}
                                            </h2>

                                            <StatusBadge status={match.status}/>
                                        </div>

                                        <div className="mb-3">
                                            <div className="flex flex-wrap gap-2">
                                                {winners.map((player) => (
                                                    <span
                                                        key={player.id}
                                                        className="px-2 py-1 rounded-md bg-gold/10 border border-gold/30 text-gold text-xs font-semibold"
                                                    >
                            {player.player_detail?.nickname}
                          </span>
                                                ))}

                                                {participants.map((player) => (
                                                    <span
                                                        key={player.id}
                                                        className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-white/60 text-xs"
                                                    >
                            {player.player_detail?.nickname}
                          </span>
                                                ))}
                                            </div>
                                        </div>

                                        <p className="text-white/40 text-xs">
                                            Submitted by{" "}
                                            <span className="text-white/70">
                        {match.submitted_by_name}
                      </span>
                                            {" • "}
                                            {new Date(match.submitted_at).toLocaleDateString("en-PH")}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-wrap gap-2 shrink-0">
                                        <Link
                                            to={`/matches/${match.id}`}
                                            className="btn-cyan text-xs px-4 py-2"
                                        >
                                            View Details
                                        </Link>

                                        {match.status === "Pending" && (
                                            <>
                                                <button
                                                    onClick={() => handleApprove(match.id)}
                                                    disabled={busy === match.id}
                                                    className="btn-success text-xs px-4 py-2"
                                                >
                                                    {busy === match.id
                                                        ? "Processing..."
                                                        : "Approve"}
                                                </button>

                                                <button
                                                    onClick={() => handleDecline(match.id)}
                                                    disabled={busy === match.id}
                                                    className="btn-danger text-xs px-4 py-2"
                                                >
                                                    {busy === match.id
                                                        ? "Processing..."
                                                        : "Decline"}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}