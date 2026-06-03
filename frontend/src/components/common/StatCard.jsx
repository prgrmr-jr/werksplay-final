export default function StatCard({ label, value, icon, color = "cyan" }) {
  const colorMap = {
    cyan:   "border-cyan/30 text-cyan",
    gold:   "border-gold/30 text-gold",
    purple: "border-purple/30 text-purple",
    green:  "border-green-500/30 text-green-400",
    red:    "border-red-500/30 text-red-400",
  };
  return (
    <div className={`card border ${colorMap[color]} flex flex-col gap-1`}>
      <div className="text-white/40 text-xs font-game uppercase tracking-wider flex items-center gap-1">
        {icon && <span>{icon}</span>} {label}
      </div>
      <div className={`text-3xl font-game font-bold ${colorMap[color].split(" ")[1]}`}>
        {value ?? "—"}
      </div>
    </div>
  );
}
