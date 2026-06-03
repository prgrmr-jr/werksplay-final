import {useState, useEffect} from "react";
import {useNavigate, useLocation} from "react-router-dom";
import {useAuth} from "../auth/AuthContext";

export default function AdminLogin() {
    const navigate = useNavigate();
    const location = useLocation();
    const {user, loading, login} = useAuth();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if (!loading && user && user.is_staff) {
            const dest = location.state?.from?.pathname ?? "/admin";
            navigate(dest, {replace: true});
        }
    }, [user, loading, navigate, location.state]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setBusy(true);

        try {
            await login(username, password);
        } catch (err) {
            const status = err.response?.status;
            setError(
                status === 401 || status === 403
                    ? "Invalid username or password."
                    : "Server error. Please try again."
            );
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="min-h-screen bg-navy bg-grid flex items-center justify-center p-6">

            {/* Soft background glow layer */}
            <div
                className="absolute w-[500px] h-[500px] bg-cyan/10 blur-[120px] rounded-full -top-40 -left-40 pointer-events-none"/>
            <div
                className="absolute w-[400px] h-[400px] bg-purple/10 blur-[120px] rounded-full bottom-0 right-0 pointer-events-none"/>

            {/* Login Container */}
            <div className="w-full max-w-md relative">

                {/* Brand Header Panel */}
                <div className="text-center mb-6">
                    <div className="flex justify-center mb-4">
                        <div className="p-3">
                            <img
                                src="/werksplay-logo.png"
                                alt="WerksPlay Logo"
                                className="w-20 h-20 object-contain"
                            />
                        </div>
                    </div>

                    <h1 className="font-game font-bold text-2xl text-white uppercase tracking-wider">
                        WERKSPLAY <span className="text-cyan text-glow-cyan">PORTAL</span>
                    </h1>
                </div>

                {/* Card */}
                <div className="card-cyan p-6 space-y-5">

                    {/* Error */}
                    {error && (
                        <div
                            className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">

                        <div>
                            <label className="block text-white/50 text-xs font-game uppercase tracking-wider mb-1.5">
                                Username
                            </label>
                            <input
                                className="input"
                                placeholder="admin"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                autoComplete="username"
                                autoFocus
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-white/50 text-xs font-game uppercase tracking-wider mb-1.5">
                                Password
                            </label>
                            <input
                                className="input"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={busy}
                            className="btn-gold w-full justify-center py-3 text-base"
                        >
                            {busy ? "Signing in..." : "Sign In"}
                        </button>
                    </form>

                    {/* Footer hint */}
                    <div className="pt-2 text-center">
                        <a
                            href="/"
                            className="text-white/30 hover:text-white/60 text-xs transition"
                        >
                            RETURN TO SITE
                        </a>
                    </div>

                </div>
            </div>
        </div>
    );
}