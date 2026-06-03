import { Link } from "react-router-dom";

export default function PlayerCard({ player }) {
  return (
    <Link
      to={`/players/${player.id}`}
      className="card-cyan block hover:border-cyan/60 hover:shadow-cyan transition-all duration-200 group text-center"
    >
      <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-cyan/20 group-hover:border-cyan/60 transition mx-auto mb-3">
        {player.photo
          ? <img src={player.photo} alt={player.nickname} className="w-full h-full object-cover" />
          : <div className="w-full h-full bg-navy-600 flex items-center justify-center text-cyan/60 text-2xl font-bold font-game">
              {player.nickname?.[0]?.toUpperCase()}
            </div>}
      </div>
      <div className="font-game font-bold text-white group-hover:text-cyan transition">{player.nickname}</div>
      <div className="text-xs text-white/30 mt-0.5">{player.fullname}</div>
      {player.department && (
        <div className="mt-2 inline-block px-2 py-0.5 rounded-full bg-purple/10 border border-purple/20 text-purple text-xs">
          {player.department}
        </div>
      )}
    </Link>
  );
}
