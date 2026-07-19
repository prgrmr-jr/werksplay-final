import { useState } from "react";
import {
  ChevronDownIcon,
  ShieldCheckIcon,
  TrophyIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

function TeamPhoto({ team, size = 6 }) {
  const sizes = {
    6: { box: "h-6 w-6", icon: "h-3.5 w-3.5" },
    7: { box: "h-7 w-7", icon: "h-4 w-4" },
    10: { box: "h-10 w-10", icon: "h-5 w-5" },
  };
  const selected = sizes[size] ?? sizes[6];

  return (
    <div className={`${selected.box} flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-navy-700`}>
      {team?.photo
        ? <img src={team.photo} alt={team.name} className="h-full w-full object-cover" />
        : <ShieldCheckIcon className={`${selected.icon} text-white/20`} />}
    </div>
  );
}

function MembersPopup({ team, onClose }) {
  return (
    <div className="absolute left-0 top-full z-50 mt-1 w-52 overflow-hidden rounded-xl border border-cyan/30 bg-navy-800 shadow-cyan">
      <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
        <TeamPhoto team={team} size={6} />
        <span className="min-w-0 flex-1 truncate font-game text-xs font-bold uppercase tracking-wider text-cyan">{team.name}</span>
        <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="shrink-0 rounded text-white/30 hover:text-white" aria-label="Close team members">
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>
      <ul className="py-1">
        {team.members?.length === 0 && (
          <li className="px-3 py-2 text-xs italic text-white/30">No members.</li>
        )}
        {team.members?.map((m) => (
          <li key={m.id} className="flex items-center gap-2 px-3 py-2 hover:bg-white/5">
            <div className="h-6 w-6 shrink-0 overflow-hidden rounded-full border border-white/10">
              {m.player_detail?.photo
                ? <img src={m.player_detail.photo} alt="" className="h-full w-full object-cover" />
                : <div className="flex h-full w-full items-center justify-center bg-navy-600 text-xs font-bold text-white/40">
                    {m.player_detail?.nickname?.[0]}
                  </div>}
            </div>
            <span className="truncate font-game text-xs text-white/70">{m.player_detail?.nickname}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TeamSlot({ team, slot, isWinner, isBye, swapMode, isAdmin, onSwap, swapSelection, matchId }) {
  const [showMembers, setShowMembers] = useState(false);
  const selected = swapSelection?.matchId === matchId && swapSelection?.slot === slot;

  const handleClick = (e) => {
    e.stopPropagation();
    if (swapMode && isAdmin) {
      onSwap(slot, team);
    } else if (team) {
      setShowMembers(!showMembers);
    }
  };

  return (
    <div className="relative">
      <div
        onClick={handleClick}
        className={`flex items-center gap-2 rounded-lg px-2 py-1.5 transition-all duration-150 ${
          team ? "cursor-pointer" : "cursor-default"
        } ${
          isWinner
            ? "border border-gold/40 bg-gold/15 hover:border-gold/60"
            : isBye
            ? "border border-cyan/20 bg-cyan/5"
            : team
            ? "border border-white/10 bg-navy-700/60 hover:border-cyan/30"
            : "border border-white/5 bg-navy-700/40"
        } ${swapMode && isAdmin && team ? "hover:border-cyan/50" : ""}
          ${selected ? "border-cyan ring-1 ring-cyan/50" : ""}`}
      >
        {team ? (
          <>
            {/* Team photo */}
            <TeamPhoto team={team} size={6} />

            {/* Team name */}
            <span className={`min-w-0 flex-1 truncate font-game text-xs font-semibold ${
              isWinner ? "text-gold" : "text-white/90"
            }`}>
              {team.name}
            </span>

            {isWinner && <TrophyIcon className="h-4 w-4 shrink-0 text-gold" />}
            {isBye && <span className="shrink-0 text-xs text-cyan/50">BYE</span>}
            {!swapMode && <ChevronDownIcon className="h-3.5 w-3.5 shrink-0 text-white/20" />}
          </>
        ) : (
          <span className="pl-1 font-game text-xs italic text-white/20">TBD</span>
        )}
      </div>

      {showMembers && team && !swapMode && (
        <MembersPopup team={team} onClose={() => setShowMembers(false)} />
      )}
    </div>
  );
}

function MatchCard({ match, onSelectMatch, isAdmin, swapMode, onSwapSlot, swapSelection }) {
  const isPending  = match.status === "Pending";
  const hasTeams   = match.team_a_detail && match.team_b_detail;
  const canDeclare = isAdmin && isPending && hasTeams && !match.is_bye;

  const aIsWinner = match.winner != null && match.winner === match.team_a;
  const bIsWinner = match.winner != null && match.winner === match.team_b;

  return (
    <div className={`w-52 overflow-visible rounded-xl border transition-all duration-200 ${
      match.status === "Completed"
        ? "border-white/10 bg-navy-800/80"
        : "border-white/10 bg-navy-800 hover:border-white/20"
    }`}>
      <div className="flex flex-col gap-1 p-2">
        <TeamSlot
          team={match.team_a_detail} slot="a"
          isWinner={aIsWinner} isBye={match.is_bye && !match.team_b}
          swapMode={swapMode} isAdmin={isAdmin}
          onSwap={(slot, team) => onSwapSlot(match.id, slot, team)}
          swapSelection={swapSelection} matchId={match.id}
        />
        <div className="text-center font-game text-xs text-white/20">VS</div>
        <TeamSlot
          team={match.team_b_detail} slot="b"
          isWinner={bIsWinner} isBye={match.is_bye && !match.team_a}
          swapMode={swapMode} isAdmin={isAdmin}
          onSwap={(slot, team) => onSwapSlot(match.id, slot, team)}
          swapSelection={swapSelection} matchId={match.id}
        />
      </div>

      {canDeclare && (
        <button
          onClick={() => onSelectMatch(match)}
          className="w-full border-t border-cyan/20 bg-cyan/10 py-1.5 font-game text-xs font-semibold text-cyan transition-all hover:bg-cyan/20"
        >
          Declare Winner
        </button>
      )}
    </div>
  );
}

export default function BracketView({ matches, isAdmin, onSelectMatch, swapMode, onSwapSlot, swapSelection }) {
  if (!matches || matches.length === 0) {
    return <p className="py-10 text-center font-game text-white/30">Bracket not generated yet.</p>;
  }

  const rounds = {};
  matches.forEach((m) => {
    if (!rounds[m.round_number]) rounds[m.round_number] = [];
    rounds[m.round_number].push(m);
  });

  const roundNumbers = Object.keys(rounds).map(Number).sort((a, b) => a - b);
  const totalRounds  = roundNumbers.length;

  const roundLabel = (n) => {
    if (n === totalRounds)     return "Final";
    if (n === totalRounds - 1) return "Semi-Finals";
    if (n === totalRounds - 2) return "Quarter-Finals";
    return `Round ${n}`;
  };

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex min-w-max items-start gap-8 px-2 pt-4">
        {roundNumbers.map((rnd) => (
          <div key={rnd} className="flex flex-col gap-2">
            <div className="mb-3 text-center">
              <span className={`inline-flex items-center justify-center gap-1 font-game text-sm font-bold uppercase tracking-wider ${
                rnd === totalRounds ? "text-gold text-glow-gold" : "text-cyan/70"
              }`}>
                {rnd === totalRounds && <TrophyIcon className="h-4 w-4" />}
                {roundLabel(rnd)}
              </span>
            </div>
            <div
              className="flex flex-col"
              style={{
                gap: `${Math.pow(2, rnd - 1) * 16 + (Math.pow(2, rnd - 1) - 1) * 8}px`,
                paddingTop: `${(Math.pow(2, rnd - 1) - 1) * 4}px`,
              }}
            >
              {rounds[rnd].map((match) => (
                <MatchCard
                  key={match.id} match={match}
                  isAdmin={isAdmin} onSelectMatch={onSelectMatch}
                  swapMode={swapMode} onSwapSlot={onSwapSlot} swapSelection={swapSelection}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
