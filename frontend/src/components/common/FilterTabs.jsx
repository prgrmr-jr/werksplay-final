export default function FilterTabs({ options, active, onChange }) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={
            `px-4 py-1.5 rounded-full text-xs font-game font-semibold uppercase tracking-wider border transition-all duration-200 ` +
            (active === opt.value
              ? "bg-cyan/15 text-cyan border-cyan/40"
              : "text-white/40 border-white/10 hover:text-white hover:border-white/30")
          }
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
