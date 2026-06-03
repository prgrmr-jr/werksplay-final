import {Link} from "react-router-dom";
import StatusBadge from "../common/StatusBadge";

export default function MatchCard({match}) {
    const winners =
        match.participants?.filter((p) => p.is_winner) ?? [];
    const others =
        match.participants?.filter((p) => !p.is_winner) ?? [];

    const previewPlayers = [
        ...winners.map((p) => ({
            name: p.player_detail?.nickname,
            type: "winner",
        })),
        ...others.map((p) => ({
            name: p.player_detail?.nickname,
            type: "normal",
        })),
    ].slice(0, 6); // keep it compact

    return (
        <Link
            to={`/matches/${match.id}`}
            className="card-cyan group hover:border-cyan/60 transition-all duration-200"
        >
            {/* TOP ROW */}
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="font-game text-xs text-cyan uppercase tracking-wider truncate">
                        {match.game_detail?.name ?? "Unknown Game"}
                    </p>

                    <p className="text-white/30 text-xs mt-1">
                        {match.submitted_by_name}
                    </p>
                </div>

                <StatusBadge status={match.status}/>
            </div>

            {/* PLAYERS PREVIEW */}
            <div className="mt-3 flex flex-wrap gap-1.5">
                {previewPlayers.map((p, i) => (
                    <span
                        key={i}
                        className={
                            p.type === "winner"
                                ? "px-2 py-0.5 rounded bg-gold/10 border border-gold/20 text-gold text-[11px]"
                                : "px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/50 text-[11px]"
                        }
                    >
            {p.name ?? "?"}
          </span>
                ))}

                {match.participants?.length > 6 && (
                    <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/40 text-[11px]">
            +{match.participants.length - 6}
          </span>
                )}
            </div>

            {/* FOOTER */}
            <div
                className="flex items-center justify-between mt-3 pt-3 border-t border-white/5 text-[11px] text-white/30">
        <span>
          {new Date(match.submitted_at).toLocaleDateString("en-PH", {
              month: "short",
              day: "numeric",
          })}
        </span>
                <span className="text-cyan/60 group-hover:text-cyan transition">
          View →
        </span>
            </div>
        </Link>
    );
}