import {useState} from "react";
import {Link, useSearchParams} from "react-router-dom";
import {useSideQuests} from "../hooks/useSideQuests";
import {
    approveSideQuest,
    declineSideQuest,
    completeSideQuest,
} from "../api/sidequests";

import StatusBadge from "../components/common/StatusBadge";
import FilterTabs from "../components/common/FilterTabs";
import Spinner from "../components/common/Spinner";

const FILTERS = [
    {label: "All", value: ""},
    {label: "Pending", value: "Pending"},
    {label: "Approved", value: "Approved"},
    {label: "Completion Pending", value: "Completion Pending"},
    {label: "Declined", value: "Declined"},
    {label: "Completed", value: "Completed"},
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

export default function AdminSideQuests() {
    const [searchParams] = useSearchParams();

    const initialFilter =
        searchParams.get("filter") ?? "Pending";

    const [filter, setFilter] = useState(initialFilter);

    const {data, loading, refresh} =
        useSideQuests(filter);

    const [busy, setBusy] = useState(null);
    const [errorMap, setErrorMap] = useState({});

    const setQuestError = (id, message) =>
        setErrorMap((prev) => ({
            ...prev,
            [id]: message,
        }));

    const clearQuestError = (id) =>
        setErrorMap((prev) => {
            const copy = {...prev};
            delete copy[id];
            return copy;
        });

    const action = (fn, id) => async () => {
        clearQuestError(id);
        setBusy(id);

        try {
            await fn(id);
            refresh();
        } catch (err) {
            setQuestError(id, parseError(err));
        } finally {
            setBusy(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="font-game font-bold text-3xl text-white uppercase tracking-wider">
                    Side Quest Moderation
                </h1>

                <p className="text-white/40 text-sm mt-1">
                    Review, approve, and validate side quests.
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
                        No side quests found.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {data.map((quest) => {
                        const isCompletionPending =
                            quest.status === "Completion Pending";

                        return (
                            <div
                                key={quest.id}
                                className={`card-purple ${
                                    isCompletionPending
                                        ? "border-orange-500/30 bg-orange-500/5"
                                        : ""
                                }`}
                            >
                                {/* Error */}
                                {errorMap[quest.id] && (
                                    <div
                                        className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 flex items-start gap-3">
                    <span className="flex-1">
                      {errorMap[quest.id]}
                    </span>

                                        <button
                                            onClick={() =>
                                                clearQuestError(quest.id)
                                            }
                                            className="text-red-300 hover:text-red-100"
                                        >
                                            ×
                                        </button>
                                    </div>
                                )}

                                <div className="flex flex-col lg:flex-row lg:justify-between gap-5">
                                    {/* Left */}
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-3 mb-3">
                                            <h2 className="font-game font-bold text-purple text-lg">
                                                {quest.player_detail?.nickname}
                                            </h2>

                                            {quest.game_detail && (
                                                <span className="text-white/40 text-xs">
                          {quest.game_detail.name}
                        </span>
                                            )}

                                            <StatusBadge status={quest.status}/>
                                        </div>

                                        <p className="text-white/70 text-sm mb-3">
                                            {quest.goal}
                                        </p>

                                        {isCompletionPending &&
                                            quest.completion_proof_image && (
                                                <div
                                                    className="mb-3 overflow-hidden rounded-xl border border-orange-500/20">
                                                    <img
                                                        src={quest.completion_proof_image}
                                                        alt="Completion Proof"
                                                        className="w-full max-h-40 object-cover"
                                                    />
                                                </div>
                                            )}

                                        {isCompletionPending &&
                                            quest.completion_notes && (
                                                <div
                                                    className="mb-3 rounded-lg bg-orange-500/10 border border-orange-500/20 px-3 py-2">
                                                    <p className="text-orange-300 text-xs">
                                                        {quest.completion_notes}
                                                    </p>
                                                </div>
                                            )}

                                        <p className="text-white/30 text-xs">
                                            Submitted{" "}
                                            {new Date(
                                                quest.submitted_at
                                            ).toLocaleDateString("en-PH")}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-wrap gap-2 shrink-0">
                                        <Link
                                            to={`/sidequests/${quest.id}`}
                                            className="btn-purple text-xs px-4 py-2"
                                        >
                                            View Details
                                        </Link>

                                        {quest.status === "Pending" && (
                                            <>
                                                <button
                                                    onClick={action(
                                                        approveSideQuest,
                                                        quest.id
                                                    )}
                                                    disabled={busy === quest.id}
                                                    className="btn-success text-xs px-4 py-2"
                                                >
                                                    {busy === quest.id
                                                        ? "Processing..."
                                                        : "Approve"}
                                                </button>

                                                <button
                                                    onClick={action(
                                                        declineSideQuest,
                                                        quest.id
                                                    )}
                                                    disabled={busy === quest.id}
                                                    className="btn-danger text-xs px-4 py-2"
                                                >
                                                    {busy === quest.id
                                                        ? "Processing..."
                                                        : "Decline"}
                                                </button>
                                            </>
                                        )}

                                        {quest.status === "Approved" && (
                                            <button
                                                onClick={action(
                                                    declineSideQuest,
                                                    quest.id
                                                )}
                                                disabled={busy === quest.id}
                                                className="btn-danger text-xs px-4 py-2"
                                            >
                                                {busy === quest.id
                                                    ? "Processing..."
                                                    : "Decline"}
                                            </button>
                                        )}

                                        {quest.status ===
                                            "Completion Pending" && (
                                                <>
                                                    <button
                                                        onClick={action(
                                                            completeSideQuest,
                                                            quest.id
                                                        )}
                                                        disabled={busy === quest.id}
                                                        className="px-4 py-2 rounded-lg text-xs font-semibold bg-orange-500/15 border border-orange-500/40 text-orange-400 hover:bg-orange-500/25 transition"
                                                    >
                                                        {busy === quest.id
                                                            ? "Processing..."
                                                            : "Award Points"}
                                                    </button>

                                                    <button
                                                        onClick={action(
                                                            declineSideQuest,
                                                            quest.id
                                                        )}
                                                        disabled={busy === quest.id}
                                                        className="btn-danger text-xs px-4 py-2"
                                                    >
                                                        {busy === quest.id
                                                            ? "Processing..."
                                                            : "Reject"}
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