/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy:   { DEFAULT: "#0d1117", 800: "#161b22", 700: "#1c2333", 600: "#21262d" },
        cyan:   { DEFAULT: "#00e5ff", glow: "rgba(0,229,255,0.35)" },
        purple: { DEFAULT: "#c084fc", glow: "rgba(192,132,252,0.35)" },
        gold:   { DEFAULT: "#fbbf24", glow: "rgba(251,191,36,0.35)" },
        green:  { neon: "#22c55e" },
        red:    { neon: "#f87171" },
      },
      fontFamily: {
        game: ["'Rajdhani'", "sans-serif"],
        sans: ["'Inter'", "sans-serif"],
      },
      boxShadow: {
        cyan:   "0 0 12px rgba(0,229,255,0.5)",
        purple: "0 0 12px rgba(192,132,252,0.5)",
        gold:   "0 0 12px rgba(251,191,36,0.5)",
      },
      backgroundImage: {
        "grid-pattern": "linear-gradient(rgba(0,229,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.04) 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "40px 40px",
      },
    },
  },
  plugins: [],
};
