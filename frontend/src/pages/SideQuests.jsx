import {useState, useMemo} from "react";
import {Link} from "react-router-dom";

import {useSideQuests} from "../hooks/useSideQuests";
import SideQuestCard from "../components/sidequests/SideQuestCard";
import FilterTabs from "../components/common/FilterTabs";
import Spinner from "../components/common/Spinner";
import PageTitle from "../components/common/PageTitle";

const FILTERS = [
    {label: "All", value: ""},
    {label: "Pending", value: "Pending"},
    {label: "Approved", value: "Approved"},
    {label: "Completion Pending", value: "Completion Pending"},
    {label: "Declined", value: "Declined"},
    {label: "Completed", value: "Completed"},
];

export default function SideQuests() {
    const [filter, setFilter] = useState("");
    const [search, setSearch] = useState("");

    const {data, loading} = useSideQuests(filter);

    const filtered = useMemo(() => {
        if (!search.trim()) return data;

        const q = search.toLowerCase();

        return data.filter((quest) => {
            const player =
                quest.player_detail?.nickname?.toLowerCase() ?? "";

            const game =
                quest.game_detail?.name?.toLowerCase() ?? "";

            const goal =
                quest.goal?.toLowerCase() ?? "";

            return (
                player.includes(q) ||
                game.includes(q) ||
                goal.includes(q)
            );
        });
    }, [data, search]);

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <PageTitle
                    title="SIDE QUESTS"
                    sub="Browse challenges, objectives, and player progress."
                />

                <Link
                    to="/submit-sidequest"
                    className="btn-cyan"
                >
                    Request Challenge
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
                    placeholder="Search by player, game, or objective"
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
                            {filtered.length} Challenges
                        </span>

                        {search && (
                            <span className="text-white/30 text-xs">
                                Search: "{search}"
                            </span>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map((quest) => (
                            <SideQuestCard
                                key={quest.id}
                                quest={quest}
                            />
                        ))}

                        {filtered.length === 0 && (
                            <div className="col-span-full py-12 text-center">
                                <p className="text-white/40 font-medium">
                                    No challenges found
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