import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  TrophyIcon,
  UsersIcon,
  CalendarDaysIcon,
  TagIcon,
} from "@heroicons/react/24/outline";

import { getTournaments } from "../api/tournaments";
import Spinner from "../components/common/Spinner";
import FilterTabs from "../components/common/FilterTabs";
import PageTitle from "../components/common/PageTitle";
import Countdown from "../components/tournaments/Countdown";

const FILTERS = [
  { label: "All", value: "" },
  { label: "Registration", value: "Registration" },
  { label: "In Progress", value: "In Progress" },
  { label: "Completed", value: "Completed" },
];

const STATUS_STYLES = {
  Registration:
      "bg-cyan/10 text-cyan border border-cyan/30",
  "In Progress":
      "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30",
  Completed:
      "bg-green-500/10 text-green-400 border border-green-500/30",
};

export default function Tournaments() {
  const [all, setAll] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTournaments()
        .then((res) => setAll(res.data.results ?? res.data))
        .finally(() => setLoading(false));
  }, []);

  const tournaments = filter
      ? all.filter((t) => t.status === filter)
      : all;

  return (
      <div className="space-y-6">
        <PageTitle
            icon={<TrophyIcon className="w-7 h-7" />}
            title="TOURNAMENTS"
            sub="Register your team and compete."
        />

        <FilterTabs
            options={FILTERS}
            active={filter}
            onChange={setFilter}
        />

        {loading ? (
            <Spinner />
        ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {tournaments.length === 0 && (
                  <div className="col-span-full py-14 text-center text-white/40">
                    No tournaments available.
                  </div>
              )}

              {tournaments.map((t) => (
                  <Link
                      key={t.id}
                      to={`/tournaments/${t.id}`}
                      className="group rounded-2xl border border-white/10 bg-[#111827] p-5 transition duration-300 hover:border-cyan hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan/10"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="line-clamp-2 text-lg font-bold text-white transition group-hover:text-cyan">
                        {t.name}
                      </h2>

                      <span
                          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[t.status]}`}
                      >
                  {t.status}
                </span>
                    </div>

                    {/* Game */}
                    <div className="mt-5 flex items-center gap-2 text-white/70">
                      <TagIcon className="h-4 w-4 text-cyan" />
                      <span className="text-sm">
                  {t.game_detail?.name || "Unknown Game"}
                </span>
                    </div>

                    {/* Info */}
                    <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 rounded-lg bg-white/5 p-2">
                        <UsersIcon className="h-4 w-4 text-cyan" />
                        <div>
                          <p className="text-white font-medium">
                            {t.team_size}v{t.team_size}
                          </p>
                          <p className="text-xs text-white/50">
                            Team Size
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 rounded-lg bg-white/5 p-2">
                        <CalendarDaysIcon className="h-4 w-4 text-cyan" />
                        <div>
                          <p className="text-white font-medium">
                            {t.team_count}
                          </p>
                          <p className="text-xs text-white/50">
                            Registered
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Countdown */}
                    <div className="mt-5 border-t border-white/10 pt-4">
                      <Countdown tournament={t} compact />
                    </div>
                  </Link>
              ))}
            </div>
        )}
      </div>
  );
}