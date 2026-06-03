export default function PageTitle({ icon, title, sub }) {
  return (
    <div className="mb-8">
      <h1 className="font-game font-bold text-3xl md:text-4xl text-white flex items-center gap-3">
        {icon && <span className="text-3xl">{icon}</span>}
        <span className="text-glow-cyan">{title}</span>
      </h1>
      {sub && <p className="mt-1 text-white/40 text-sm">{sub}</p>}
    </div>
  );
}
