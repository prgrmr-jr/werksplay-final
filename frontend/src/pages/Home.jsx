import { Link } from "react-router-dom";
import { Zap } from "lucide-react";

export default function Home() {
  return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden text-white">
        {/*/!* Animated Background *!/*/}
        {/*<div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top_left,rgba(0,229,255,.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(255,193,7,.14),transparent_35%)]" />*/}

        {/*/!* Floating Glow Effects *!/*/}
        {/*<div className="absolute -top-24 left-10 h-72 w-72 animate-pulse rounded-full bg-cyan-500/20 blur-3xl" />*/}
        {/*<div className="absolute bottom-0 right-10 h-80 w-80 animate-pulse rounded-full bg-yellow-400/20 blur-3xl [animation-delay:1.5s]" />*/}

        {/* Grid Overlay */}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

        <div className="mx-auto flex max-w-5xl flex-col items-center justify-center px-6 text-center">
          {/* Badge */}
          <span className="inline-flex animate-bounce items-center gap-2 rounded-full border border-green-400/40 bg-green-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[.3em] text-green-400 shadow-[0_0_20px_rgba(34,197,94,.35)]">
          <Zap size={14} />
          Tournament Registration Open
        </span>

          {/* Heading */}
          <h1 className="mt-8 font-game text-5xl uppercase leading-tight sm:text-7xl lg:text-8xl">
            Ready to
            <span className="block animate-pulse bg-gradient-to-r from-cyan-400 via-white to-yellow-400 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(34,211,238,.8)]">
            Dominate the Arena?
          </span>
          </h1>

          {/* Description */}
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-white/70">
            Register your team, compete in official esports tournaments, and
            battle the best players in Mobile Legends, Dota 2, and Valorant.
          </p>

          {/* CTA */}
          <div className="mt-10">
            <Link
                to="/tournaments"
                className="group relative inline-flex overflow-hidden rounded-xl bg-yellow-400 px-8 py-4 font-game uppercase tracking-wider text-black transition duration-300 hover:scale-110 hover:shadow-[0_0_35px_rgba(250,204,21,.8)]"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <span className="relative">View Tournaments</span>
            </Link>
          </div>
        </div>
      </main>
  );
}