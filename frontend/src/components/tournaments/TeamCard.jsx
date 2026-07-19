import { useState, useMemo, useRef, useEffect } from "react";
import {
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ShieldCheckIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

/** Single reusable team avatar - shows photo or shield fallback */
export function TeamAvatar({ team, size = "md" }) {
  const sizes = { sm: "h-7 w-7", md: "h-10 w-10", lg: "h-16 w-16" };
  const iconSizes = { sm: "h-4 w-4", md: "h-5 w-5", lg: "h-8 w-8" };

  return (
    <div className={`${sizes[size]} flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-navy-700`}>
      {team?.photo
        ? <img src={team.photo} alt={team.name} className="h-full w-full object-cover" />
        : <ShieldCheckIcon className={`${iconSizes[size]} text-white/30`} />}
    </div>
  );
}

export default function TeamCard({
  team, teamSize, registrationOpen,
  onDelete, onRemoveMember, onAddMember,
  allPlayers = [],
}) {
  const isFull = team.member_count >= teamSize;

  const takenPlayerIds = useMemo(() =>
    new Set(team.members?.map((m) => m.player?.id ?? m.player_detail?.id) ?? []),
    [team.members]
  );

  const [showAdd,    setShowAdd]    = useState(false);
  const [search,     setSearch]     = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [addError,   setAddError]   = useState("");
  const dropRef = useRef(null);

  useEffect(() => {
    const h = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setShowAdd(false);
        setSearch("");
        setAddError("");
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const filtered = useMemo(() =>
    allPlayers.filter((p) => {
      const q = search.toLowerCase();
      return (
        !takenPlayerIds.has(p.id) &&
        (p.nickname.toLowerCase().includes(q) || p.fullname.toLowerCase().includes(q))
      );
    }),
    [allPlayers, search, takenPlayerIds]
  );

  const handleAdd = async (playerId) => {
    setAddError("");
    setAddLoading(true);
    try {
      await onAddMember(team.id, playerId);
      setShowAdd(false);
      setSearch("");
    } catch (err) {
      setAddError(err.response?.data?.detail ?? "Failed to add player.");
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <div className="card-cyan transition-all duration-200 hover:border-cyan/50">
      {/* Header - team photo + name + delete */}
      <div className="mb-3 flex items-center gap-3">
        <TeamAvatar team={team} size="md" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-game text-base font-bold text-white">{team.name}</h3>
          <span className={`inline-flex items-center gap-1 text-xs font-game font-semibold ${
            isFull ? "text-green-400" : "text-yellow-400"
          }`}>
            {team.member_count}/{teamSize} players
            {!isFull && (
              <span className="inline-flex items-center gap-1 text-yellow-400/60">
                <ExclamationTriangleIcon className="h-3 w-3" />
                Incomplete
              </span>
            )}
          </span>
        </div>
        {registrationOpen && (
          <button
            onClick={() => onDelete(team.id)}
            className="inline-flex shrink-0 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-red-400/70 transition-all duration-150 hover:border-red-500/50 hover:bg-red-500/20 hover:text-red-400"
            aria-label={`Delete ${team.name}`}
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Members */}
      <div className="mb-3 flex flex-col gap-2">
        {team.members?.map((m) => (
          <div key={m.id} className="group flex items-center gap-2">
            <div className="h-7 w-7 shrink-0 overflow-hidden rounded-full border border-white/10">
              {m.player_detail?.photo
                ? <img src={m.player_detail.photo} alt={m.player_detail.nickname} className="h-full w-full object-cover" />
                : <div className="flex h-full w-full items-center justify-center bg-navy-600 text-xs font-bold text-white/40">
                    {m.player_detail?.nickname?.[0]?.toUpperCase()}
                  </div>}
            </div>
            <span className="min-w-0 flex-1 truncate font-game text-xs text-white/60">{m.player_detail?.nickname}</span>
            {registrationOpen && (
              <button
                onClick={() => onRemoveMember(team.id, m.id)}
                className="shrink-0 rounded text-red-400/50 opacity-100 transition-all duration-150 hover:text-red-400 sm:opacity-0 sm:group-hover:opacity-100"
                aria-label={`Remove ${m.player_detail?.nickname}`}
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
        {team.members?.length === 0 && (
          <p className="text-xs italic text-white/20">No members yet.</p>
        )}
      </div>

      {/* Add player */}
      {registrationOpen && !isFull && (
        <div className="relative" ref={dropRef}>
          <button
            onClick={() => { setShowAdd(!showAdd); setSearch(""); setAddError(""); }}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-cyan/30 py-2 text-xs font-game font-semibold text-cyan/60 transition-all duration-200 hover:border-cyan/60 hover:text-cyan"
          >
            <PlusIcon className="h-4 w-4" />
            Add Player
          </button>

          {showAdd && (
            <div className="absolute bottom-full left-0 right-0 z-50 mb-1 overflow-hidden rounded-xl border border-cyan/30 bg-navy-800 shadow-cyan">
              <div className="border-b border-white/10 p-2">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
                  <input autoFocus className="input py-1.5 pl-8 text-xs" placeholder="Search players..."
                    value={search} onChange={(e) => setSearch(e.target.value)}
                    onClick={(e) => e.stopPropagation()} />
                </div>
              </div>
              {addError && (
                <p className="flex items-center gap-1 bg-red-500/10 px-3 py-2 text-xs text-red-400">
                  <ExclamationTriangleIcon className="h-3.5 w-3.5 shrink-0" />
                  {addError}
                </p>
              )}
              <ul className="max-h-48 overflow-y-auto">
                {filtered.length === 0
                  ? <li className="px-4 py-3 text-center text-xs text-white/30">
                      {search ? `No players match "${search}"` : "All players are in a team."}
                    </li>
                  : filtered.map((p) => (
                    <li key={p.id} onClick={() => !addLoading && handleAdd(p.id)}
                      className="flex cursor-pointer items-center gap-3 px-3 py-2.5 text-white/70 transition-all duration-100 hover:bg-white/5 hover:text-white"
                    >
                      <div className="h-7 w-7 shrink-0 overflow-hidden rounded-full border border-white/10">
                        {p.photo
                          ? <img src={p.photo} alt={p.nickname} className="h-full w-full object-cover" />
                          : <div className="flex h-full w-full items-center justify-center bg-navy-600 text-xs font-bold text-white/40">
                              {p.nickname?.[0]?.toUpperCase()}
                            </div>}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-game text-xs font-semibold">{p.nickname}</p>
                        <p className="truncate text-xs text-white/30">{p.fullname}</p>
                      </div>
                      {addLoading && <span className="shrink-0 text-xs text-cyan">...</span>}
                    </li>
                  ))
                }
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
