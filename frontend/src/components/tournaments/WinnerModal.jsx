export default function WinnerModal({ match, onConfirm, onClose, loading }) {
  if (!match) return null;

  const teams = [
    { detail: match.team_a_detail, id: match.team_a },
    { detail: match.team_b_detail, id: match.team_b },
  ].filter((t) => t.detail);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-sm card-cyan">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-game font-bold text-lg text-white uppercase tracking-wider">
            Declare Winner
          </h2>
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl">✕</button>
        </div>

        <p className="text-white/40 text-xs font-game mb-4 uppercase tracking-wider">
          Round {match.round_number} · Match {match.match_number}
        </p>

        <div className="flex flex-col gap-3">
          {teams.map(({ detail, id }) => (
            <button
              key={id}
              disabled={loading}
              onClick={() => onConfirm(match.id, id)}
              className="flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-navy-700/60 hover:border-gold/50 hover:bg-gold/5 transition-all duration-200 group"
            >
              {/* Team photo */}
              <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-white/10 group-hover:border-gold/40 shrink-0 bg-navy-600 flex items-center justify-center transition-all">
                {detail?.photo
                  ? <img src={detail.photo} alt={detail.name} className="w-full h-full object-cover" />
                  : <span className="text-white/20 text-lg">🛡️</span>}
              </div>

              <div className="flex-1 text-left">
                <p className="font-game font-bold text-white group-hover:text-gold transition text-base">{detail?.name}</p>
                <p className="text-white/30 text-xs mt-0.5">{detail?.members?.length} player{detail?.members?.length !== 1 ? "s" : ""}</p>
              </div>

              <span className="text-2xl group-hover:scale-125 transition-transform duration-200">👑</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
