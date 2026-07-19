import { useEffect, useState }        from "react";
import { useParams, Link }            from "react-router-dom";
import {
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  PuzzlePieceIcon,
  Squares2X2Icon,
  TrophyIcon,
  UsersIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { getTournament, deleteTeam, removeMember, addMember } from "../api/tournaments";
import { getAllActivePlayers }         from "../api/players";
import BracketView                    from "../components/tournaments/BracketView";
import TeamCard                       from "../components/tournaments/TeamCard";
import TournamentChat                 from "../components/tournaments/TournamentChat";
import Countdown                      from "../components/tournaments/Countdown";
import Spinner                        from "../components/common/Spinner";

const STATUS_STYLES = {
  "Registration": "bg-cyan/10 text-cyan border border-cyan/30",
  "In Progress":  "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30",
  "Completed":    "bg-green-500/10 text-green-400 border border-green-500/30",
};

const TABS = [
  { value: "bracket", label: "Bracket", icon: TrophyIcon },
  { value: "teams", label: "Teams", icon: UsersIcon },
  { value: "chat", label: "Chat", icon: ChatBubbleLeftRightIcon },
];

export default function TournamentDetail() {
  const { id }                      = useParams();
  const [tournament, setT]          = useState(null);
  const [allPlayers, setAllPlayers] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [tab,        setTab]        = useState("bracket");
  const [error,      setError]      = useState("");

  const reload = () =>
    getTournament(id).then((r) => setT(r.data)).finally(() => setLoading(false));

  useEffect(() => {
    reload();
    getAllActivePlayers().then((r) => setAllPlayers(r.data.results ?? r.data));
  }, [id]);

  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm("Delete this team? This cannot be undone.")) return;
    setError("");
    try { await deleteTeam(id, teamId); reload(); }
    catch (err) { setError(err.response?.data?.detail ?? "Failed to delete team."); }
  };

  const handleRemoveMember = async (teamId, memberId) => {
    if (!window.confirm("Remove this player from the team?")) return;
    setError("");
    try { await removeMember(id, teamId, memberId); reload(); }
    catch (err) { setError(err.response?.data?.detail ?? "Failed to remove member."); }
  };

  const handleAddMember = async (teamId, playerId) => {
    await addMember(id, teamId, playerId);
    reload();
  };

  if (loading) return <Spinner size="lg" />;
  if (!tournament) return <p className="text-white/30 text-center py-20">Tournament not found.</p>;

  const canEdit = tournament.status !== "Completed";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="card-cyan">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[tournament.status]}`}>
                {tournament.status}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-game text-white/50">
                {tournament.team_count} team{tournament.team_count !== 1 ? "s" : ""}
              </span>
            </div>

            <h1 className="break-words font-game text-2xl font-bold uppercase tracking-wider text-white text-glow-cyan sm:text-3xl">
              {tournament.name}
            </h1>
            <p className="mt-2 text-sm text-white/40">
              View the bracket, registered teams, and tournament chat in one place.
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            {tournament.status !== "Completed" && (
              <Link to={`/tournaments/${id}/register`} className="btn-gold w-full justify-center text-sm sm:w-auto">
                <PlusIcon className="h-4 w-4" />
                Register Team
              </Link>
            )}
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
            <PuzzlePieceIcon className="h-5 w-5 shrink-0 text-cyan" />
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wider text-white/35">Game</p>
              <p className="truncate text-sm font-semibold text-white">{tournament.game_detail?.name || "Unknown Game"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
            <UsersIcon className="h-5 w-5 shrink-0 text-cyan" />
            <div>
              <p className="text-xs uppercase tracking-wider text-white/35">Format</p>
              <p className="text-sm font-semibold text-white">{tournament.team_size}v{tournament.team_size}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
            <Squares2X2Icon className="h-5 w-5 shrink-0 text-cyan" />
            <div>
              <p className="text-xs uppercase tracking-wider text-white/35">Registered</p>
              <p className="text-sm font-semibold text-white">{tournament.team_count} team{tournament.team_count !== 1 ? "s" : ""}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Countdown */}
      <div>
        <Countdown tournament={tournament} />
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <ExclamationTriangleIcon className="mt-0.5 h-4 w-4 shrink-0" />
          <span className="min-w-0 flex-1">{error}</span>
          <button onClick={() => setError("")} className="rounded text-red-400/50 transition hover:text-red-400" aria-label="Dismiss error">
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-2 sm:inline-flex sm:flex-wrap">
        {TABS.map(({ value, label, icon: Icon }) => (
          <button key={value} onClick={() => setTab(value)}
            className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-game font-semibold uppercase tracking-wider transition-all duration-200 sm:px-4 ${
              tab === value ? "bg-cyan/15 text-cyan border-cyan/40" : "text-white/40 border-white/10 hover:text-white"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="truncate">
              {value === "teams" ? `${label} (${tournament.team_count})` : label}
            </span>
          </button>
        ))}
      </div>

      {tab === "bracket" && (
        <div className="card-cyan overflow-hidden p-3 sm:p-5">
          {tournament.matches.length === 0 ? (
            <div className="flex flex-col items-center px-4 py-14 text-center">
              <div className="mb-4 rounded-2xl border border-cyan/20 bg-cyan/10 p-4 text-cyan">
                <TrophyIcon className="h-9 w-9" />
              </div>
              <p className="font-game font-bold text-white/60">Bracket not generated yet.</p>
              <p className="mt-2 max-w-md text-sm text-white/30">
                {tournament.team_count} team{tournament.team_count !== 1 ? "s" : ""} registered.
                Admin will generate the bracket when ready.
              </p>
            </div>
          ) : (
            <BracketView matches={tournament.matches} isAdmin={false} />
          )}
        </div>
      )}

      {tab === "teams" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {tournament.teams.length === 0 && (
            <p className="col-span-full text-white/30 text-center py-10">No teams registered yet.</p>
          )}
          {tournament.teams.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              teamSize={tournament.team_size}
              registrationOpen={canEdit}
              onDelete={handleDeleteTeam}
              onRemoveMember={handleRemoveMember}
              onAddMember={handleAddMember}
              allPlayers={allPlayers}
            />
          ))}
        </div>
      )}

      {tab === "chat" && (
        <TournamentChat tournamentId={id} />
      )}
    </div>
  );
}
