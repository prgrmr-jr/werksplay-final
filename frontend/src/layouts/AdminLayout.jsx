import {Link, NavLink, useNavigate} from "react-router-dom";
import {useAuth} from "../auth/AuthContext";

const ADMIN_LINKS = [
    {to: "/admin", label: "Dashboard"},
    {to: "/admin/matches", label: "Matches"},
    {to: "/admin/sidequests", label: "Side Quests"},
    {to: "/admin/games", label: "Games"},
    {to: "/admin/tournaments", label: "Tournaments"},
    {to: "/players/manage", label: "Players"},
];

export default function AdminLayout({children}) {
    const {user, logout} = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/admin/login", {replace: true});
    };

    return (
        <div className="min-h-screen bg-navy bg-grid flex">
            {/* Sidebar */}
            <aside className="w-60 shrink-0 bg-navy-800 border-r border-white/10 flex flex-col">
                {/* Logo */}
                <div className="h-16 flex items-center px-6 border-b border-white/10">
                    <Link
                        to="/admin"
                        className="font-game font-bold text-white text-sm tracking-wider"
                    >
                        <span className="text-cyan">WERKSPLAY</span>
                        <span className="text-white/40 ml-2">ADMIN</span>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1">
                    {ADMIN_LINKS.map(({to, label}) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={to === "/admin"}
                            className={({isActive}) =>
                                `block px-4 py-3 rounded-lg text-sm font-game font-semibold transition-all duration-200 ${
                                    isActive
                                        ? "bg-cyan/10 border border-cyan/20 text-cyan"
                                        : "text-white/50 hover:text-white hover:bg-white/5"
                                }`
                            }
                        >
                            {label}
                        </NavLink>
                    ))}
                </nav>

                {/* User */}
                <div className="p-4 border-t border-white/10">
                    {user && (
                        <div className="mb-4 p-3 rounded-lg border border-white/10 bg-white/[0.02]">
                            <p className="text-xs text-white/30 uppercase tracking-wider">
                                Logged In
                            </p>

                            <p className="text-sm text-white font-semibold mt-1 truncate">
                                {user.username}
                            </p>
                        </div>
                    )}

                    <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2.5 rounded-lg text-sm font-game font-semibold text-red-400 hover:bg-red-500/10 transition-all duration-200"
                    >
                        Logout
                    </button>

                    <Link
                        to="/"
                        className="block text-center mt-2 px-4 py-2.5 rounded-lg text-sm text-white/40 hover:text-white hover:bg-white/5 transition-all duration-200"
                    >
                        Back to Site
                    </Link>
                </div>
            </aside>

            {/* Content */}
            <div className="flex-1 flex flex-col min-h-screen">
                <header className="h-16 bg-navy-800/80 border-b border-white/10 flex items-center justify-between px-6">
                    <h1 className="font-game text-white/50 text-sm uppercase tracking-[0.2em]">
                        Administration
                    </h1>

                    {user && (
                        <span className="text-white/30 text-xs">
                            {user.username}
                        </span>
                    )}
                </header>

                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}