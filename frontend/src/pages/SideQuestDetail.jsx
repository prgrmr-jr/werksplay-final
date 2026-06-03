import { useEffect, useState } from "react";
import { useParams }           from "react-router-dom";
import { getSideQuest, submitCompletion } from "../api/sidequests";
import StatusBadge             from "../components/common/StatusBadge";
import CommentSection          from "../components/comments/CommentSection";
import Spinner                 from "../components/common/Spinner";

export default function SideQuestDetail() {
  const { id }                = useParams();
  const [quest, setQuest]     = useState(null);
  const [loading, setLoading] = useState(true);

  const reload = () =>
    getSideQuest(id).then((r) => setQuest(r.data)).finally(() => setLoading(false));

  useEffect(() => { reload(); }, [id]);

  if (loading) return <Spinner size="lg" />;
  if (!quest)  return <p className="text-white/30 text-center py-20">Side quest not found.</p>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card-purple mb-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h1 className="font-game font-bold text-2xl text-purple">
            ⚔️ Side Quest #{quest.id}
          </h1>
          <StatusBadge status={quest.status} />
        </div>

        {/* Player + Game */}
        <div className="flex items-center gap-3 mb-5 p-3 bg-navy-700 rounded-lg">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-purple/30 shrink-0">
            {quest.player_detail?.photo
              ? <img src={quest.player_detail.photo} alt="" className="w-full h-full object-cover" />
              : <div className="w-full h-full bg-navy-600 flex items-center justify-center text-purple font-bold font-game">
                  {quest.player_detail?.nickname?.[0]}
                </div>}
          </div>
          <div className="flex-1">
            <p className="font-game font-semibold text-white">{quest.player_detail?.nickname}</p>
            <p className="text-white/30 text-xs">{quest.player_detail?.department}</p>
          </div>
          {quest.game_detail && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple/10 border border-purple/20">
              <span className="text-sm">🕹️</span>
              <span className="text-purple text-xs font-game font-semibold">{quest.game_detail.name}</span>
            </div>
          )}
        </div>

        {/* Goal */}
        <div className="mb-5 p-4 bg-navy-700 rounded-lg">
          <p className="text-white/40 text-xs font-game uppercase tracking-wider mb-2">Goal</p>
          <p className="text-white/80">{quest.goal}</p>
        </div>

        {/* Ranks */}
        {(quest.current_rank || quest.highest_rank) && (
          <div className="grid grid-cols-2 gap-3 mb-5">
            {quest.current_rank && (
              <div className="p-3 bg-navy-700 rounded-lg">
                <p className="text-white/30 text-xs mb-1">Current Rank</p>
                <p className="text-white/80 font-semibold">{quest.current_rank}</p>
              </div>
            )}
            {quest.highest_rank && (
              <div className="p-3 bg-navy-700 rounded-lg">
                <p className="text-white/30 text-xs mb-1">Highest Rank</p>
                <p className="text-white/80 font-semibold">{quest.highest_rank}</p>
              </div>
            )}
          </div>
        )}

        {/* Original proof image */}
        {quest.proof_image && (
          <div className="mb-5 rounded-xl overflow-hidden border border-white/10">
            <p className="text-white/30 text-xs font-game px-3 pt-2">Submission Proof</p>
            <img src={quest.proof_image} alt="Proof" className="w-full object-cover max-h-72" />
          </div>
        )}

        {/* Completion proof image — shown after completion is submitted */}
        {quest.completion_proof_image && (
          <div className="mb-5 rounded-xl overflow-hidden border border-orange-500/20 bg-orange-500/5">
            <p className="text-orange-400 text-xs font-game px-3 pt-2">🔍 Completion Proof</p>
            <img src={quest.completion_proof_image} alt="Completion Proof" className="w-full object-cover max-h-72" />
            {quest.completion_notes && (
              <p className="text-white/50 text-sm px-3 py-2">{quest.completion_notes}</p>
            )}
          </div>
        )}

        {/* Completed — points awarded */}
        {quest.status === "Completed" && (
          <div className="p-4 bg-cyan/5 border border-cyan/20 rounded-lg text-center mb-4">
            <p className="text-cyan font-game font-bold text-2xl">⚡ +{quest.points} pts awarded!</p>
          </div>
        )}

        {/* Completion Pending notice */}
        {quest.status === "Completion Pending" && (
          <div className="p-4 bg-orange-500/5 border border-orange-500/20 rounded-lg text-center mb-4">
            <p className="text-orange-400 font-game font-semibold">🔍 Awaiting admin validation</p>
            <p className="text-white/40 text-xs mt-1">
              Completion proof submitted. An admin will review and award points soon.
            </p>
          </div>
        )}

        {/* Meta */}
        <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
          <div className="bg-navy-700 rounded-lg p-3">
            <p className="text-white/30 text-xs mb-1">Submitted</p>
            <p className="text-white/80">
              {new Date(quest.submitted_at).toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" })}
            </p>
          </div>
          {quest.approved_at && (
            <div className="bg-navy-700 rounded-lg p-3">
              <p className="text-white/30 text-xs mb-1">Approved</p>
              <p className="text-white/80">
                {new Date(quest.approved_at).toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" })}
              </p>
            </div>
          )}
          {quest.completed_at && (
            <div className="bg-navy-700 rounded-lg p-3">
              <p className="text-white/30 text-xs mb-1">Completed</p>
              <p className="text-white/80">
                {new Date(quest.completed_at).toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" })}
              </p>
            </div>
          )}
        </div>

        {quest.notes && (
          <div className="mt-4 bg-navy-700 rounded-lg p-3">
            <p className="text-white/30 text-xs mb-1">Notes</p>
            <p className="text-white/70 text-sm">{quest.notes}</p>
          </div>
        )}
      </div>

      {/* ── Submit Completion Panel (public, only when Approved) ── */}
      {quest.status === "Approved" && (
        <CompletionSubmitPanel questId={quest.id} onSuccess={reload} />
      )}

      {/* Comments */}
      <div className="card-purple">
        <CommentSection model="sidequest" objectId={quest.id} />
      </div>
    </div>
  );
}

function CompletionSubmitPanel({ questId, onSuccess }) {
  const [proof,        setProof]        = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [notes,        setNotes]        = useState("");
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");
  const [success,      setSuccess]      = useState(false);

  const handleProof = (e) => {
    const file = e.target.files[0];
    setProof(file);
    if (file) setProofPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!proof) return setError("Please upload a proof photo.");

    const fd = new FormData();
    fd.append("completion_proof_image", proof);
    fd.append("completion_notes",       notes);

    setLoading(true);
    try {
      await submitCompletion(questId, fd);
      setSuccess(true);
      onSuccess();
    } catch (err) {
      const data = err.response?.data;
      setError(data?.detail ?? JSON.stringify(data) ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (success) return null; // panel disappears after submit (quest reloads to Completion Pending)

  return (
    <div className="mb-6 rounded-xl border border-orange-500/30 bg-orange-500/5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-orange-500/20">
        <span className="text-2xl">🏁</span>
        <div>
          <p className="font-game font-bold text-white text-sm uppercase tracking-wider">
            Submit for Completion
          </p>
          <p className="text-white/40 text-xs mt-0.5">
            Upload proof that you completed the goal. An admin will review and award your points.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        {error && (
          <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Proof photo */}
        <div>
          <label className="block text-white/60 text-xs font-game uppercase tracking-wider mb-2">
            Proof Photo <span className="text-red-400">*</span>
          </label>
          {proofPreview && (
            <div className="mb-3 rounded-xl overflow-hidden border border-white/10 max-h-48">
              <img src={proofPreview} alt="Preview" className="w-full object-cover max-h-48" />
            </div>
          )}
          <label className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg border border-orange-500/30 bg-orange-500/10 text-orange-400 text-sm font-game font-semibold cursor-pointer hover:bg-orange-500/20 transition-all duration-200">
            📷 {proof ? proof.name : "SELECT PROOF PHOTO"}
            <input type="file" accept="image/*" className="hidden" onChange={handleProof} />
          </label>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-white/60 text-xs font-game uppercase tracking-wider mb-2">
            Notes (optional)
          </label>
          <textarea
            className="input resize-none" rows={3}
            placeholder="Describe what you accomplished…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-game font-bold text-sm uppercase tracking-wider bg-orange-500 text-white hover:bg-orange-400 transition-all duration-200 disabled:opacity-50"
        >
          {loading ? "Submitting…" : "🏁 SUBMIT FOR COMPLETION"}
        </button>
      </form>
    </div>
  );
}
