import {useState, useEffect} from "react";
import {getAllPlayers, createPlayer, updatePlayer} from "../api/players";
import Spinner from "../components/common/Spinner";

export default function AdminPlayers() {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const [fullname, setFullname] = useState("");
    const [nickname, setNickname] = useState("");
    const [department, setDepartment] = useState("");
    const [bio, setBio] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const fetchPlayers = () => {
        setLoading(true);
        getAllPlayers()
            .then((r) => setPlayers(r.data.results ?? r.data))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchPlayers();
    }, []);

    const openNew = () => {
        setEditing(null);
        setFullname("");
        setNickname("");
        setDepartment("");
        setBio("");
        setIsActive(true);
        setPhoto(null);
        setPhotoPreview(null);
        setError("");
        setShowForm(true);
    };

    const openEdit = (p) => {
        setEditing(p);
        setFullname(p.fullname);
        setNickname(p.nickname);
        setDepartment(p.department ?? "");
        setBio(p.bio ?? "");
        setIsActive(p.is_active);
        setPhoto(null);
        setPhotoPreview(p.photo ?? null);
        setError("");
        setShowForm(true);
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPhoto(file);
        setPhotoPreview(URL.createObjectURL(file));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setError("");

        const fd = new FormData();
        fd.append("fullname", fullname.trim());
        fd.append("nickname", nickname.trim());
        fd.append("department", department.trim());
        fd.append("bio", bio.trim());
        fd.append("is_active", isActive ? "true" : "false");
        if (photo) fd.append("photo", photo);

        setSaving(true);
        try {
            if (editing) await updatePlayer(editing.id, fd);
            else await createPlayer(fd);

            setShowForm(false);
            fetchPlayers();
        } catch (err) {
            const data = err.response?.data;

            if (data && typeof data === "object") {
                const msg = Object.entries(data)
                    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
                    .join(" | ");
                setError(msg);
            } else {
                setError(data ?? "Something went wrong.");
            }
        } finally {
            setSaving(false);
        }
    };

    const active = players.filter((p) => p.is_active);
    const inactive = players.filter((p) => !p.is_active);

    return (
        <div className="space-y-8">

            {/* HEADER (UNIFIED STYLE) */}
            <div>
                <h1 className="font-game font-bold text-3xl text-white">
                    PLAYER MANAGEMENT
                </h1>

                <p className="text-white/40 text-sm mt-1">
                    Manage players, profiles, and status
                </p>
            </div>

            {/* ACTION BAR */}
            <div className="flex justify-end">
                <button onClick={openNew} className="btn-cyan">
                    Add Player
                </button>
            </div>

            {/* LIST */}
            {loading ? (
                <Spinner/>
            ) : (
                <div className="space-y-8">

                    {/* ACTIVE */}
                    <div>
                        <h2 className="text-xs uppercase tracking-widest text-white/50 mb-3">
                            Active ({active.length})
                        </h2>

                        <div className="space-y-2">
                            {active.length === 0 && (
                                <p className="text-white/30 text-sm text-center py-4">
                                    No active players
                                </p>
                            )}

                            {active.map((p) => (
                                <PlayerRow key={p.id} player={p} onEdit={openEdit}/>
                            ))}
                        </div>
                    </div>

                    {/* INACTIVE */}
                    {inactive.length > 0 && (
                        <div>
                            <h2 className="text-xs uppercase tracking-widest text-white/30 mb-3">
                                Inactive ({inactive.length})
                            </h2>

                            <div className="space-y-2 opacity-60">
                                {inactive.map((p) => (
                                    <PlayerRow key={p.id} player={p} onEdit={openEdit}/>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* MODAL */}
            {showForm && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="card-cyan w-full max-w-md max-h-[90vh] overflow-y-auto">

                        <div className="flex items-center justify-between mb-5">
                            <h2 className="font-game font-bold text-lg text-white uppercase tracking-wider">
                                {editing ? "Edit Player" : "New Player"}
                            </h2>

                            <button
                                onClick={() => setShowForm(false)}
                                className="text-white/40 hover:text-white"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-4">

                            {error && (
                                <div
                                    className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            <input className="input" placeholder="Full name *"
                                   value={fullname} onChange={(e) => setFullname(e.target.value)} required/>

                            <input className="input" placeholder="Nickname *"
                                   value={nickname} onChange={(e) => setNickname(e.target.value)} required/>

                            <input className="input" placeholder="Department"
                                   value={department} onChange={(e) => setDepartment(e.target.value)}/>

                            <textarea className="input resize-none" rows={3}
                                      placeholder="Bio"
                                      value={bio} onChange={(e) => setBio(e.target.value)}/>

                            {/* PHOTO */}
                            <div>
                                {photoPreview && (
                                    <div
                                        className="w-20 h-20 mx-auto rounded-full overflow-hidden border border-cyan/30 mb-2">
                                        <img src={photoPreview} className="w-full h-full object-cover"/>
                                    </div>
                                )}

                                <label className="btn-purple w-full justify-center cursor-pointer text-xs">
                                    Upload Photo
                                    <input type="file" className="hidden" onChange={handlePhotoChange}/>
                                </label>
                            </div>

                            {/* ACTIVE TOGGLE */}
                            {editing && (
                                <label className="flex items-center justify-between cursor-pointer">
                                    <span className="text-sm text-white/70">Active</span>

                                    <div
                                        onClick={() => setIsActive(!isActive)}
                                        className={`w-10 h-5 rounded-full relative transition ${
                                            isActive ? "bg-cyan/60" : "bg-white/10"
                                        }`}
                                    >
                                        <div
                                            className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition ${
                                                isActive ? "translate-x-5" : "translate-x-0.5"
                                            }`}
                                        />
                                    </div>
                                </label>
                            )}

                            {/* BUTTONS */}
                            <div className="flex gap-3 pt-2">
                                <button className="btn-gold flex-1" disabled={saving}>
                                    {saving ? "Saving..." : editing ? "Save Changes" : "Add Player"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="btn-danger flex-1"
                                >
                                    Cancel
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

/* PLAYER ROW */
function PlayerRow({player, onEdit}) {
    return (
        <div className="card-cyan flex items-center gap-4">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-cyan/20">
                {player.photo ? (
                    <img src={player.photo} className="w-full h-full object-cover"/>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-cyan font-bold">
                        {player.nickname?.[0]?.toUpperCase()}
                    </div>
                )}
            </div>

            <div className="flex-1 min-w-0">
                <p className="font-game font-semibold text-white truncate">
                    {player.nickname}
                </p>
                <p className="text-white/40 text-xs truncate">
                    {player.fullname} · {player.department}
                </p>
            </div>

            <button onClick={() => onEdit(player)} className="btn-cyan text-xs px-3 py-1.5">
                Edit
            </button>
        </div>
    );
}