import { Link } from "react-router-dom";
import StatusBadge from "../common/StatusBadge";

export default function SideQuestCard({ quest }) {
  return (
    <Link
      to={`/sidequests/${quest.id}`}
      className="card-purple block hover:border-purple/60 hover:shadow-purple transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="font-game font-bold text-sm text-purple uppercase tracking-wider">
          ⚔️ {quest.player_detail?.nickname ?? "Unknown"}
        </span>
        <StatusBadge status={quest.status} />
      </div>

      {quest.game_detail && (
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-xs">🕹️</span>
          <span className="text-purple/70 text-xs font-game font-semibold">{quest.game_detail.name}</span>
        </div>
      )}

      <p className="text-white/70 text-sm line-clamp-2 mb-3">{quest.goal}</p>

      <div className="flex items-center justify-between text-xs text-white/30">
        {quest.current_rank && <span>Rank: {quest.current_rank}</span>}
        <span>{new Date(quest.submitted_at).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}</span>
      </div>

      {quest.status === "Completed" && (
        <div className="mt-3 flex items-center gap-1 text-cyan text-xs font-semibold">
          ⚡ +{quest.points} pts awarded
        </div>
      )}
    </Link>
  );
}
