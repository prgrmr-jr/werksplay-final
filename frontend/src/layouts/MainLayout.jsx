import {Link, NavLink, useNavigate} from "react-router-dom";
import {useState} from "react";
import logo from "../public/werksplay-logo.png";

const NAV_LINKS = [
    {to: "/", label: "Home"},
    {to: "/leaderboard", label: "Leaderboard"},
    {to: "/players", label: "Players"},
    {to: "/games", label: "Games"},
    {to: "/matches", label: "Matches"},
    {to: "/sidequests", label: "Side Quests"},
    {to: "/calendar", label: "Calendar"},
    {to: "/tools", label: "Tools"},
];

export default function MainLayout({children}) {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-navy bg-grid flex flex-col">
            {/* Navbar */}
            <header className="sticky top-0 z-50 bg-navy-800/90 backdrop-blur-md border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <img
                            src={logo}
                            alt="WerksPlay logo"
                            className="h-10 w-auto object-contain"
                        />
                        <span className="font-game font-bold text-lg text-white leading-none">
              WERKS<span className="text-cyan">PLAY</span>
            </span>
                    </Link>

                    {/* Desktop nav */}
                    <nav className="hidden md:flex items-center gap-1">
                        {NAV_LINKS.map(({to, label}) => (
                            <NavLink
                                key={to}
                                to={to}
                                end={to === "/"}
                                className={({isActive}) =>
                                    `px-4 py-2 rounded-lg text-sm font-game font-semibold uppercase tracking-wider transition-all duration-200 ` +
                                    (isActive
                                        ? "text-cyan bg-cyan/10 border border-cyan/30"
                                        : "text-white/60 hover:text-white hover:bg-white/5")
                                }
                            >
                                {label}
                            </NavLink>
                        ))}
                    </nav>

                    {/* CTA buttons */}
                    <div className="hidden md:flex items-center gap-2">
                        <Link to="/submit-match" className="btn-purple text-xs py-2 px-3">+ Match</Link>
                        <Link to="/submit-sidequest" className="btn-cyan text-xs py-2 px-3">+ Quest</Link>
                        {/*<Link to="/admin"            className="text-white/40 hover:text-white text-xs px-3 py-2 transition">Admin</Link>*/}
                    </div>

                    {/* Mobile hamburger */}
                    <button
                        className="md:hidden text-white/60 hover:text-white"
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        <span className="text-xl">{menuOpen ? "✕" : "☰"}</span>
                    </button>
                </div>

                {/* Mobile menu */}
                {menuOpen && (
                    <div className="md:hidden border-t border-white/10 bg-navy-800 px-4 py-4 flex flex-col gap-2">
                        {NAV_LINKS.map(({to, label}) => (
                            <NavLink
                                key={to}
                                to={to}
                                end={to === "/"}
                                onClick={() => setMenuOpen(false)}
                                className={({isActive}) =>
                                    `px-4 py-2 rounded-lg text-sm font-game font-semibold uppercase tracking-wider ` +
                                    (isActive ? "text-cyan bg-cyan/10" : "text-white/60")
                                }
                            >
                                {label}
                            </NavLink>
                        ))}
                        <div className="flex gap-2 pt-2">
                            <Link to="/submit-match" onClick={() => setMenuOpen(false)}
                                  className="btn-purple flex-1 justify-center text-xs">+ Match</Link>
                            <Link to="/submit-sidequest" onClick={() => setMenuOpen(false)}
                                  className="btn-cyan flex-1 justify-center text-xs">+ Quest</Link>
                        </div>
                    </div>
                )}
            </header>

            {/* Page content */}
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
                {children}
            </main>

            {/* Footer */}
            <footer
                className="border-t border-white/10 bg-navy-800/50 py-6 text-center text-white/40 text-xs font-game font-bold">
                <a
                    href="/"
                    className="transition-colors hover:text-primary-400"
                >
                    WERKSPLAY
                </a>{" "}
                © {new Date().getFullYear()} • ALL RIGHTS RESERVED
            </footer>
        </div>
    );
}
