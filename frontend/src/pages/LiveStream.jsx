import { Link } from "react-router-dom";
import { Radio, Clock3 } from "lucide-react";

export default function LiveStream() {
    return (
        <main className="flex min-h-screen items-center justify-center px-6 text-white">
            <div className="max-w-3xl text-center">
                {/* Live Badge */}
                <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-red-500/10 px-5 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-red-400">
                    <span className="h-3 w-3 animate-pulse rounded-full bg-red-500" />
                    <Radio size={16} />
                    Live Stream
                </div>

                {/* Title */}
                <h1 className="font-game text-5xl uppercase sm:text-6xl">
                    Live Moments
                    <span className="mt-2 block bg-gradient-to-r from-red-500 via-white to-yellow-400 bg-clip-text text-transparent">
            Coming Soon
          </span>
                </h1>

                {/* Description */}
                <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/70">
                    The tournament hasn't gone live yet. Once the matches begin, this page
                    will feature the official live stream, match highlights, and exciting
                    moments from every game.
                </p>


                {/* CTA */}
                <div className="mt-10">
                    <Link
                        to="/tournaments"
                        className="inline-flex items-center rounded-xl bg-yellow-400 px-8 py-3 font-game uppercase tracking-wider text-black transition hover:scale-105 hover:bg-yellow-300"
                    >
                        View Tournaments
                    </Link>
                </div>
            </div>
        </main>
    );
}