import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  CameraIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  TrophyIcon,
  UserGroupIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { getTournament, registerTeam }  from "../api/tournaments";
import { getAllActivePlayers }          from "../api/players";
import Spinner                          from "../components/common/Spinner";

function getErrorMessage(err) {
  const data = err.response?.data;

  if (data && typeof data === "object") {
    return Object.entries(data)
        .flatMap(([field, value]) => {
          const messages = Array.isArray(value) ? value : [value];
          return messages.map((message) =>
              field === "non_field_errors" || field === "detail"
                  ? String(message)
                  : `${field}: ${message}`
          );
        })
        .join(" ");
  }

  if (typeof data === "string") {
    if (data.trim().startsWith("<!DOCTYPE") || data.trim().startsWith("<html")) {
      return "Registration failed. Please check if the team name is already taken and try again.";
    }

    return data;
  }

  return "Something went wrong. Please try again.";
}

export default function TournamentRegister() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [tournament, setT]        = useState(null);
  const [players,    setPlayers]  = useState([]);
  const [tLoading,   setTLoading] = useState(true);

  const [teamName,      setTeamName]      = useState("");
  const [teamPhoto,     setTeamPhoto]     = useState(null);
  const [photoPreview,  setPhotoPreview]  = useState(null);
  const [photoError,    setPhotoError]    = useState("");
  const [selectedIds,   setSelectedIds]   = useState([]);
  const [search,        setSearch]        = useState("");
  const [error,         setError]         = useState("");
  const [loading,       setLoading]       = useState(false);

  const MAX_MB = 5;

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > MAX_MB * 1024 * 1024) {
      setPhotoError(`Photo is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is ${MAX_MB} MB.`);
      e.target.value = "";
      return;
    }
    setPhotoError("");
    setTeamPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  useEffect(() => {
    getTournament(id).then((r) => setT(r.data)).finally(() => setTLoading(false));
    getAllActivePlayers().then((r) => setPlayers(r.data.results ?? r.data));
  }, [id]);

  const filtered = useMemo(() =>
    players.filter((p) =>
      p.nickname.toLowerCase().includes(search.toLowerCase()) ||
      p.fullname.toLowerCase().includes(search.toLowerCase())
    ), [players, search]);

  const togglePlayer = (pid) => {
    setSelectedIds((prev) =>
      prev.includes(pid) ? prev.filter((x) => x !== pid) : [...prev, pid]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!teamName.trim()) return setError("Please enter a team name.");
    if (selectedIds.length < 1)
      return setError("Please select at least 1 player.");
    if (selectedIds.length > tournament.team_size)
      return setError(`Maximum ${tournament.team_size} players allowed per team.`);

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("name", teamName.trim());
      if (teamPhoto) fd.append("photo", teamPhoto);
      selectedIds.forEach((id) => fd.append("player_ids", id));
      await registerTeam(id, fd);
      navigate(`/tournaments/${id}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (tLoading) return <Spinner size="lg" />;
  if (!tournament) return <p className="text-white/30 text-center py-20">Tournament not found.</p>;
  if (tournament.status === "Completed")
    return (
      <div className="flex flex-col items-center px-4 py-20 text-center">
        <div className="mb-4 rounded-2xl border border-gold/30 bg-gold/10 p-4 text-gold">
          <TrophyIcon className="h-10 w-10" />
        </div>
        <p className="font-game font-bold text-white/50">This tournament has ended.</p>
        <Link to={`/tournaments/${id}`} className="btn-cyan mt-4 inline-flex">Back to Tournament</Link>
      </div>
    );

  return (
    <div className="mx-auto max-w-2xl px-1 sm:px-0">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan/25 bg-cyan/10 text-cyan">
          <TrophyIcon className="h-8 w-8" />
        </div>
        <h1 className="font-game text-2xl font-bold uppercase tracking-wider text-white sm:text-3xl">
          REGISTER <span className="text-cyan text-glow-cyan">TEAM</span>
        </h1>
        <p className="mt-2 text-sm text-white/40">{tournament.name} - {tournament.team_size}v{tournament.team_size}</p>
      </div>

      <form onSubmit={handleSubmit} className="card-cyan space-y-5">
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            <ExclamationTriangleIcon className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Team name */}
        <div>
          <label className="block text-white/60 text-xs font-game uppercase tracking-wider mb-2">
            Team Name *
          </label>
          <input className="input" placeholder="e.g. Team Alpha"
            value={teamName} onChange={(e) => setTeamName(e.target.value)} required />
        </div>

        {/* Team photo */}
        <div>
          <label className="block text-white/60 text-xs font-game uppercase tracking-wider mb-2">
            Team Photo <span className="text-white/30">(optional)</span>
          </label>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {/* Preview */}
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-white/10 bg-navy-700">
              {photoPreview
                ? <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                : <ShieldCheckIcon className="h-8 w-8 text-white/20" />}
            </div>
            <div className="min-w-0 flex-1">
              <label className="btn-cyan w-full cursor-pointer justify-center text-xs">
                <CameraIcon className="h-4 w-4 shrink-0" />
                <span className="truncate">{teamPhoto ? teamPhoto.name : `Upload Team Photo (max ${MAX_MB}MB)`}</span>
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </label>
              {photoError && (
                <p className="mt-1.5 flex items-start gap-1 text-xs text-red-400">
                  <ExclamationTriangleIcon className="h-3.5 w-3.5 shrink-0" />
                  {photoError}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Player picker */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-white/60 text-xs font-game uppercase tracking-wider">
              Select Players *
            </label>
            <span className={`text-xs font-semibold font-game ${
              selectedIds.length === tournament.team_size
                ? "text-green-400"
                : selectedIds.length > 0
                ? "text-cyan"
                : "text-white/30"
            }`}>
              {selectedIds.length}/{tournament.team_size} selected
            </span>
          </div>

          {/* Search */}
          <div className="relative mb-2">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <input className="input py-2 pl-9 text-sm" placeholder="Search players..."
              value={search} onChange={(e) => setSearch(e.target.value)} />
            {search && (
              <button type="button" onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded text-white/30 hover:text-white" aria-label="Clear search">
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Scrollable 3-col grid */}
          <div className="overflow-y-auto rounded-xl border border-white/10 bg-navy-700/40" style={{ maxHeight: "252px" }}>
            {filtered.length === 0
              ? <p className="text-white/30 text-xs text-center py-8">No players found.</p>
              : (
                <div className="grid grid-cols-2 gap-2 p-2 sm:grid-cols-3">
                  {filtered.map((p) => {
                    const selected = selectedIds.includes(p.id);
                    return (
                      <button type="button" key={p.id} onClick={() => togglePlayer(p.id)}
                        className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border transition-all duration-150 ${
                          selected
                            ? "bg-cyan/10 border-cyan/50"
                            : "bg-white/5 border-white/10 hover:border-white/30"
                        }`}
                      >
                        <div className={`w-11 h-11 rounded-full overflow-hidden border-2 ${selected ? "border-cyan/60" : "border-white/20"}`}>
                          {p.photo
                            ? <img src={p.photo} alt={p.nickname} className="w-full h-full object-cover" />
                            : <div className={`w-full h-full flex items-center justify-center font-bold font-game text-sm ${selected ? "bg-cyan/20 text-cyan" : "bg-navy-600 text-white/40"}`}>
                                {p.nickname?.[0]?.toUpperCase()}
                              </div>}
                        </div>
                        <span className={`text-xs font-semibold font-game truncate w-full text-center ${selected ? "text-cyan" : "text-white/60"}`}>
                          {p.nickname}
                        </span>
                        {selected && <CheckIcon className="h-4 w-4 text-cyan" />}
                      </button>
                    );
                  })}
                </div>
              )}
          </div>
        </div>

        <button type="submit" disabled={loading || !!photoError} className="btn-gold w-full justify-center py-4 text-base">
          {loading ? (
            "Registering..."
          ) : (
            <>
              <UserGroupIcon className="h-5 w-5" />
              Register Team
            </>
          )}
        </button>
      </form>
    </div>
  );
}
