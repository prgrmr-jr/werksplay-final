import { useEffect, useState }        from "react";
import { useParams, Link }            from "react-router-dom";
import { getTournament, startTournament, setWinner, swapTeams, deleteTeam, removeMember, addMember } from "../api/tournaments";
import { getAllActivePlayers }         from "../api/players";
import BracketView                    from "../components/tournaments/BracketView";
import WinnerModal                    from "../components/tournaments/WinnerModal";
import TeamCard                       from "../components/tournaments/TeamCard";
import Spinner                        from "../components/common/Spinner";

export default function AdminTournamentDetail() {
  const { id }                       = useParams();
  const [tournament, setT]           = useState(null);
  const [allPlayers, setAllPlayers]  = useState([]);
  const [loading,    setLoading]     = useState(true);
  const [tab,        setTab]         = useState("bracket");

  // Winner modal
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [winnerLoading, setWinnerLoading] = useState(false);

  // Swap mode
  const [swapMode,      setSwapMode]      = useState(false);
  const [swapSelection, setSwapSelection] = useState(null); // { matchId, slot, team }
  const [swapError,     setSwapError]     = useState("");

  const [startLoading, setStartLoading] = useState(false);
  const [startError,   setStartError]   = useState("");

  const reload = () =>
    getTournament(id).then((r) => setT(r.data)).finally(() => setLoading(false));

  useEffect(() => {
    reload();
    getAllActivePlayers().then((r) => setAllPlayers(r.data.results ?? r.data));
  }, [id]);

  const handleStart = async () => {
    setStartError("");
    setStartLoading(true);
    try {
      await startTournament(id);
      reload();
    } catch (err) {
      setStartError(err.response?.data?.detail ?? "Failed to start tournament.");
    } finally {
      setStartLoading(false);
    }
  };

  const handleSetWinner = async (matchId, winnerId) => {
    setWinnerLoading(true);
    try {
      await setWinner(id, matchId, winnerId);
      setSelectedMatch(null);
      reload();
    } catch (err) {
      console.error(err);
    } finally {
      setWinnerLoading(false);
    }
  };

  const handleSwapSlot = async (matchId, slot, team) => {
    setSwapError("");
    if (!swapSelection) {
      // First selection
      setSwapSelection({ matchId, slot, team });
      return;
    }
    // Second selection — perform swap
    if (swapSelection.matchId === matchId && swapSelection.slot === slot) {
      setSwapSelection(null);
      return;
    }
    try {
      await swapTeams(id, {
        match_id_1: swapSelection.matchId,
        slot_1:     swapSelection.slot,
        match_id_2: matchId,
        slot_2:     slot,
      });
      setSwapSelection(null);
      reload();
    } catch (err) {
      setSwapError(err.response?.data?.detail ?? "Swap failed.");
      setSwapSelection(null);
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm("Remove this team from the tournament?")) return;
    try {
      await deleteTeam(id, teamId);
      reload();
    } catch (err) {
      alert(err.response?.data?.detail ?? "Failed to remove team.");
    }
  };

  const handleRemoveMember = async (teamId, memberId) => {
    if (!window.confirm("Remove this player from the team?")) return;
    try {
      await removeMember(id, teamId, memberId);
      reload();
    } catch (err) {
      alert(err.response?.data?.detail ?? "Failed to remove member.");
    }
  };

  const handleAddMember = async (teamId, playerId) => {
    await addMember(id, teamId, playerId);
    reload();
  };

  if (loading) return <Spinner size="lg" />;
  if (!tournament) return <p className="text-white/30 text-center py-20">Not found.</p>;

  const isRegistration = tournament.status === "Registration";
  const isInProgress   = tournament.status === "In Progress";
  const isCompleted    = tournament.status === "Completed";

  const champion = isCompleted
    ? tournament.matches.find((m) => {
        const maxRound = Math.max(...tournament.matches.map((x) => x.round_number));
        return m.round_number === maxRound && m.winner;
      })?.winner_detail
    : null;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <div className="flex-1">
          <h1 className="font-game font-bold text-2xl text-white">{tournament.name}</h1>
          <p className="text-white/40 text-xs font-game mt-1">
            🕹️ {tournament.game_detail?.name} &nbsp;·&nbsp;
            👥 {tournament.team_size}v{tournament.team_size} &nbsp;·&nbsp;
            {tournament.team_count} teams
          </p>
        </div>
        <Link to="/admin/tournaments" className="text-white/30 hover:text-white text-xs transition">← All Tournaments</Link>
      </div>

      {/* Champion banner */}
      {champion && (
        <div className="card-cyan border-gold/40 bg-gold/5 text-center py-6 mb-6">
          <div className="text-4xl mb-2">🏆</div>
          <p className="font-game font-bold text-gold text-2xl text-glow-gold">{champion.name}</p>
          <p className="text-white/40 text-sm mt-1">Tournament Champion</p>
        </div>
      )}

      {/* Start button */}
      {isRegistration && (
        <div className="card-cyan mb-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <p className="font-game font-bold text-white mb-1">Ready to start?</p>
              <p className="text-white/40 text-sm">
                {tournament.team_count} team{tournament.team_count !== 1 ? "s" : ""} registered.
                Bracket will be generated randomly. Teams will be locked after starting.
              </p>
              {startError && <p className="text-red-400 text-sm mt-2">⚠️ {startError}</p>}
            </div>
            <button
              onClick={handleStart}
              disabled={startLoading || tournament.team_count < 2}
              className="btn-gold shrink-0"
            >
              {startLoading ? "Generating…" : "🚀 Generate Bracket & Start"}
            </button>
          </div>
        </div>
      )}

      {/* Swap mode toggle */}
      {isInProgress && (
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => { setSwapMode(!swapMode); setSwapSelection(null); setSwapError(""); }}
            className={`text-xs font-game font-semibold px-4 py-2 rounded-lg border transition-all duration-200 ${
              swapMode
                ? "bg-purple/20 border-purple/50 text-purple"
                : "bg-white/5 border-white/10 text-white/50 hover:text-white"
            }`}
          >
            {swapMode ? "🔄 Swap Mode ON — click two team slots" : "🔄 Swap Teams"}
          </button>
          {swapMode && swapSelection && (
            <span className="text-cyan text-xs font-game">
              Selected: <strong>{swapSelection.team?.name}</strong> — now click another slot
            </span>
          )}
          {swapError && <span className="text-red-400 text-xs">{swapError}</span>}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {["bracket", "teams"].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-xs font-game font-semibold uppercase tracking-wider border transition-all duration-200 ${
              tab === t ? "bg-cyan/15 text-cyan border-cyan/40" : "text-white/40 border-white/10 hover:text-white"
            }`}
          >
            {t === "bracket" ? "🏆 Bracket" : "👥 Teams"}
          </button>
        ))}
      </div>

      {/* Bracket */}
      {tab === "bracket" && (
        <div className="card-cyan overflow-hidden">
          <BracketView
            matches={tournament.matches}
            isAdmin={true}
            onSelectMatch={setSelectedMatch}
            swapMode={swapMode}
            onSwapSlot={handleSwapSlot}
            swapSelection={swapSelection}
          />
        </div>
      )}

      {/* Teams */}
      {tab === "teams" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tournament.teams.length === 0 && (
            <p className="col-span-full text-white/30 text-center py-10">No teams yet.</p>
          )}
          {tournament.teams.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              teamSize={tournament.team_size}
              isAdmin={true}
              registrationOpen={isRegistration}
              onDelete={handleDeleteTeam}
              onRemoveMember={handleRemoveMember}
              onAddMember={handleAddMember}
              allPlayers={allPlayers}
            />
          ))}
        </div>
      )}

      {/* Winner modal */}
      <WinnerModal
        match={selectedMatch}
        onConfirm={handleSetWinner}
        onClose={() => setSelectedMatch(null)}
        loading={winnerLoading}
      />
    </div>
  );
}
