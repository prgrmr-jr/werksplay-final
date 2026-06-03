import {useState, useMemo} from "react";
import {Link} from "react-router-dom";

import {useMatches} from "../hooks/useMatches";
import MatchCard from "../components/matches/MatchCard";
import FilterTabs from "../components/common/FilterTabs";
import Spinner from "../components/common/Spinner";
import PageTitle from "../components/common/PageTitle";

const FILTERS = [
    {label: "All", value: ""},
    {label: "Pending", value: "Pending"},
    {label: "Approved", value: "Approved"},
    {label: "Declined", value: "Declined"},
];

export default function Matches() {
    const [filter, setFilter] = useState("");
    const [search, setSearch] = useState("");

    const {data, loading} = useMatches(filter);

    const filtered = useMemo(() => {
        if (!search.trim()) return data;

        const q = search.toLowerCase();

        return data.filter((m) => {
            const game =
                m.game_detail?.name?.toLowerCase() ?? "";

            const submittedBy =
                m.submitted_by_name?.toLowerCase() ?? "";

            const players = (m.participants ?? [])
                .map(
                    (p) =>
                        p.player_detail?.nickname?.toLowerCase() ?? ""
                )
                .join(" ");

            return (
                game.includes(q) ||
                submittedBy.includes(q) ||
                players.includes(q)
            );
        });
    }, [data, search]);

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <PageTitle
                    title="MATCHES"
                    sub="Browse submitted and approved match records."
                />

                <Link
                    to="/submit-match"
                    className="btn-purple"
                >
                    Submit Match
                </Link>
            </div>

            <FilterTabs
                options={FILTERS}
                active={filter}
                onChange={setFilter}
            />

            <div className="mb-6">
                <input
                    className="input"
                    placeholder="Search by game, player, or submitter"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {loading ? (
                <Spinner/>
            ) : (
                <>
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-white/40 text-xs font-game uppercase tracking-wider">
                            {filtered.length} Matches
                        </span>

                        {search && (
                            <span className="text-white/30 text-xs">
                                Search: "{search}"
                            </span>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map((match) => (
                            <MatchCard
                                key={match.id}
                                match={match}
                            />
                        ))}

                        {filtered.length === 0 && (
                            <div className="col-span-full py-12 text-center">
                                <p className="text-white/40 font-medium">
                                    No matches found
                                </p>

                                <p className="text-white/25 text-sm mt-1">
                                    Try adjusting your filters or search terms.
                                </p>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}