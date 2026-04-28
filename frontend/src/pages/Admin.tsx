import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AxiosError } from "axios";
import {
    Users, Trophy, Shield, AlertTriangle,
    Plus, Pencil, Trash2, X, Check,
    ChevronDown, Search, RefreshCw,
    Crown, Flame, Star, Award, Gem,
    Swords, Crosshair, Zap,
    TrendingUp, Activity, Lock
} from "lucide-react";
import Silk from "../components/ui/Silk";
import { getProfile, logout } from "../services/authService";
import {
    getAdminStats, adminGetUsers, adminCreateUser, adminUpdateUser, adminDeleteUser,
    adminGetLobbies, adminUpdateLobby, adminDeleteLobby,
    type AdminStats, type CreateUserPayload, type UpdateUserPayload, type UpdateLobbyPayload
} from "../services/adminService";
import type { User, Lobby } from "../types";

// ─── Config ───────────────────────────────────────────────────────────────────

const RANKS = ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master", "Elite"] as const;

const RANK_COLOR: Record<string, string> = {
    Bronze: "#cd7f32", Silver: "#c0c0c0", Gold: "#ffd700",
    Platinum: "#e5e4e2", Diamond: "#b9f2ff", Master: "#9b30ff", Elite: "#dc143c"
};

const RANK_ICON: Record<string, typeof Award> = {
    Bronze: Award, Silver: Star, Gold: Trophy,
    Platinum: Gem, Diamond: Gem, Master: Crown, Elite: Flame
};

const LOBBY_STATUS = ["open", "pending", "in_progress", "completed", "cancelled"] as const;

const STATUS_COLOR: Record<string, { text: string; bg: string; dot: string }> = {
    open:        { text: "text-emerald-400",  bg: "rgba(34,197,94,0.12)",   dot: "bg-emerald-400"  },
    pending:     { text: "text-amber-400",    bg: "rgba(245,158,11,0.12)",  dot: "bg-amber-400"    },
    in_progress: { text: "text-blue-400",     bg: "rgba(59,130,246,0.12)",  dot: "bg-blue-400"     },
    completed:   { text: "text-white/40",     bg: "rgba(255,255,255,0.04)", dot: "bg-white/30"     },
    cancelled:   { text: "text-red-400",      bg: "rgba(239,68,68,0.12)",   dot: "bg-red-400"      },
};

const USER_STATUS_COLOR: Record<string, { text: string; bg: string }> = {
    active:    { text: "text-emerald-400", bg: "rgba(34,197,94,0.12)"  },
    suspended: { text: "text-red-400",     bg: "rgba(239,68,68,0.12)"  },
    banned:    { text: "text-red-600",     bg: "rgba(185,28,28,0.15)"  },
};

const GAME_CONFIG: Record<string, { label: string; color: string; Icon: typeof Swords }> = {
    league_of_legends: { label: "League of Legends", color: "#3B82F6", Icon: Swords    },
    valorant:          { label: "Valorant",           color: "#FF4655", Icon: Crosshair },
    pokemon_showdown:  { label: "Pokémon Showdown",   color: "#dc143c", Icon: Zap       },
};

// ─── Background ───────────────────────────────────────────────────────────────

const AdminBackground = memo(function AdminBackground() {
    return (
        <div className="fixed inset-0 z-0 w-screen h-screen overflow-hidden">
            <Silk speed={1.8} scale={1.4} color="#0d0209" noiseIntensity={0.8} rotation={0.3} />
            <div className="pointer-events-none absolute inset-0 bg-black/50" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_0%_0%,rgba(220,20,60,0.18),transparent_55%),radial-gradient(ellipse_at_100%_100%,rgba(155,48,255,0.10),transparent_55%)]" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-[var(--neutral-bg)]" />
        </div>
    );
});

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, color, bg }: {
    label: string; value: number; icon: typeof Users; color: string; bg: string;
}) {
    return (
        <motion.div
            className="group relative rounded-2xl overflow-hidden"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -3, boxShadow: `0 20px 50px ${bg}` }}
        >
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg,transparent,${color}80,transparent)` }} />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `radial-gradient(circle at 50% 0%,${bg} 0%,transparent 70%)` }} />
            <div className="relative p-5 border border-white/5 backdrop-blur-xl h-full"
                style={{ background: "linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))" }}>
                <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/30">{label}</p>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                        style={{ backgroundColor: bg, border: `1px solid ${color}30` }}>
                        <Icon size={17} style={{ color }} />
                    </div>
                </div>
                <p className="text-4xl font-black tabular-nums" style={{ color }}>{value.toLocaleString()}</p>
            </div>
        </motion.div>
    );
}

// ─── Rank badge ───────────────────────────────────────────────────────────────

function RankBadge({ rank }: { rank: string }) {
    const color = RANK_COLOR[rank] ?? "#888";
    const Icon  = RANK_ICON[rank]  ?? Award;
    return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full"
            style={{ color, background: color + "18", border: `1px solid ${color}30` }}>
            <Icon size={10} /> {rank}
        </span>
    );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status, type = "lobby" }: { status: string; type?: "lobby" | "user" }) {
    const cfg = type === "user"
        ? (USER_STATUS_COLOR[status] ?? { text: "text-white/40", bg: "rgba(255,255,255,0.05)" })
        : (STATUS_COLOR[status]      ?? { text: "text-white/40", bg: "rgba(255,255,255,0.05)", dot: "bg-white/20" });
    const dot = type === "lobby" ? (STATUS_COLOR[status]?.dot ?? "bg-white/20") : null;
    return (
        <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full capitalize ${cfg.text}`}
            style={{ background: cfg.bg }}>
            {dot && <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />}
            {status.replace("_", " ")}
        </span>
    );
}

// ─── Confirm delete dialog ────────────────────────────────────────────────────

function ConfirmDialog({ message, onConfirm, onCancel }: {
    message: string; onConfirm: () => void; onCancel: () => void;
}) {
    return (
        <motion.div className="fixed inset-0 z-[80] flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
            <motion.div
                className="relative z-10 rounded-2xl p-6 max-w-sm w-full border border-red-500/20"
                style={{ background: "linear-gradient(135deg,rgba(20,5,5,0.98),rgba(15,5,5,0.95))" }}
                initial={{ scale: 0.9, y: 16 }} animate={{ scale: 1, y: 0 }}
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                        <AlertTriangle size={18} className="text-red-400" />
                    </div>
                    <div>
                        <p className="font-bold text-white text-sm">Confirm deletion</p>
                        <p className="text-xs text-white/40">This action cannot be undone</p>
                    </div>
                </div>
                <p className="text-sm text-white/60 mb-5">{message}</p>
                <div className="flex gap-2">
                    <button onClick={onCancel}
                        className="flex-1 py-2 rounded-xl text-sm font-semibold text-white/40 hover:text-white transition-colors border border-white/10 hover:border-white/20">
                        Cancel
                    </button>
                    <button onClick={onConfirm}
                        className="flex-1 py-2 rounded-xl text-sm font-bold bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 transition-all">
                        Delete
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

// ─── User modal ───────────────────────────────────────────────────────────────

interface UserModalProps {
    user: User | null;
    onSave: (data: CreateUserPayload | UpdateUserPayload) => Promise<void>;
    onClose: () => void;
}

function UserModal({ user, onSave, onClose }: UserModalProps) {
    const isCreate = !user;
    const [form, setForm] = useState({
        username: user?.username ?? "",
        email:    user?.email    ?? "",
        password: "",
        role:     user?.role     ?? "USER",
        rank:     user?.rank     ?? "Bronze",
        mmr:      String(user?.mmr ?? 250),
        status:   (user as unknown as Record<string, string>)?.status ?? "active",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState<string | null>(null);

    function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

    async function handleSubmit() {
        setError(null);
        setLoading(true);
        try {
            const payload: Record<string, unknown> = {
                username: form.username.trim(),
                email:    form.email.trim(),
                role:     form.role,
                rank:     form.rank,
                mmr:      Number(form.mmr),
                status:   form.status,
            };
            if (form.password) payload.password = form.password;
            if (isCreate) payload.password = form.password || "changeme123";
            await onSave(payload as unknown as CreateUserPayload);
            onClose();
        } catch (err) {
            const ax = err as AxiosError<{ message?: string }>;
            setError(ax.response?.data?.message ?? "Failed to save user");
        } finally {
            setLoading(false);
        }
    }

    const inputCls = "w-full h-10 rounded-xl px-3 text-sm outline-none text-white transition-all"
        + " bg-white/5 border border-white/10 focus:border-[var(--brand-primary)]/50 focus:bg-white/8";
    const labelCls = "block text-[10px] font-bold tracking-widest uppercase text-white/30 mb-1.5";

    return (
        <motion.div className="fixed inset-0 z-[70] flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
            <motion.div
                className="relative z-10 rounded-2xl w-full max-w-lg border border-white/8 overflow-hidden"
                style={{ background: "linear-gradient(135deg,rgba(14,4,8,0.98),rgba(10,2,5,0.96))" }}
                initial={{ scale: 0.93, y: 20 }} animate={{ scale: 1, y: 0 }}
            >
                <div className="absolute top-0 left-0 right-0 h-px"
                    style={{ background: "linear-gradient(90deg,transparent,#dc143c80,transparent)" }} />

                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/20 flex items-center justify-center">
                                <Users size={16} className="text-[var(--brand-primary)]" />
                            </div>
                            <div>
                                <h2 className="text-base font-black text-white">{isCreate ? "Create User" : "Edit User"}</h2>
                                <p className="text-xs text-white/30">{isCreate ? "Add a new platform user" : `Editing ${user?.username}`}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all">
                            <X size={15} />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className={labelCls}>Username</label>
                                <input className={inputCls} value={form.username} onChange={e => set("username", e.target.value)} placeholder="ProPlayer" />
                            </div>
                            <div>
                                <label className={labelCls}>Email</label>
                                <input className={inputCls} type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="user@email.com" />
                            </div>
                        </div>

                        <div>
                            <label className={labelCls}>{isCreate ? "Password" : "New Password (leave blank to keep)"}</label>
                            <input className={inputCls} type="password" value={form.password} onChange={e => set("password", e.target.value)} placeholder={isCreate ? "Min 6 characters" : "Leave blank to keep current"} />
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className={labelCls}>Role</label>
                                <select className={inputCls + " cursor-pointer"} value={form.role} onChange={e => set("role", e.target.value)}>
                                    <option value="USER">User</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelCls}>Rank</label>
                                <select className={inputCls + " cursor-pointer"} value={form.rank} onChange={e => set("rank", e.target.value)}>
                                    {RANKS.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={labelCls}>Status</label>
                                <select className={inputCls + " cursor-pointer"} value={form.status} onChange={e => set("status", e.target.value)}>
                                    <option value="active">Active</option>
                                    <option value="suspended">Suspended</option>
                                    <option value="banned">Banned</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className={labelCls}>MMR</label>
                            <input className={inputCls} type="number" min={0} value={form.mmr} onChange={e => set("mmr", e.target.value)} placeholder="250" />
                        </div>
                    </div>

                    {error && (
                        <motion.div className="mt-4 flex items-center gap-2 text-xs text-red-300 bg-red-500/8 border border-red-500/20 rounded-xl px-3 py-2"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <AlertTriangle size={12} /> {error}
                        </motion.div>
                    )}

                    <div className="flex gap-2 mt-6">
                        <button onClick={onClose} disabled={loading}
                            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white/40 hover:text-white border border-white/10 hover:border-white/20 transition-all">
                            Cancel
                        </button>
                        <button onClick={handleSubmit} disabled={loading}
                            className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                            style={{ background: "rgba(220,20,60,0.15)", border: "1px solid rgba(220,20,60,0.35)", color: "#dc143c" }}>
                            {loading ? "Saving..." : isCreate ? "Create User" : "Save Changes"}
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

// ─── Lobby modal ──────────────────────────────────────────────────────────────

function LobbyModal({ lobby, onSave, onClose }: {
    lobby: Lobby; onSave: (data: UpdateLobbyPayload) => Promise<void>; onClose: () => void;
}) {
    const [form, setForm] = useState({
        name:          lobby.name,
        description:   lobby.description,
        game:          lobby.game,
        maxParticipants: String(lobby.maxParticipants),
        status:        lobby.status,
        prizePool:     lobby.prizePool ?? "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState<string | null>(null);

    function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

    async function handleSubmit() {
        setError(null);
        setLoading(true);
        try {
            await onSave({
                name: form.name.trim(),
                description: form.description.trim(),
                game: form.game,
                maxParticipants: Number(form.maxParticipants),
                status: form.status,
                prizePool: form.prizePool.trim(),
            });
            onClose();
        } catch (err) {
            const ax = err as AxiosError<{ message?: string }>;
            setError(ax.response?.data?.message ?? "Failed to save lobby");
        } finally {
            setLoading(false);
        }
    }

    const inputCls = "w-full h-10 rounded-xl px-3 text-sm outline-none text-white transition-all"
        + " bg-white/5 border border-white/10 focus:border-[var(--brand-primary)]/50";
    const labelCls = "block text-[10px] font-bold tracking-widest uppercase text-white/30 mb-1.5";

    return (
        <motion.div className="fixed inset-0 z-[70] flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
            <motion.div
                className="relative z-10 rounded-2xl w-full max-w-lg border border-white/8 overflow-hidden"
                style={{ background: "linear-gradient(135deg,rgba(14,4,8,0.98),rgba(10,2,5,0.96))" }}
                initial={{ scale: 0.93, y: 20 }} animate={{ scale: 1, y: 0 }}
            >
                <div className="absolute top-0 left-0 right-0 h-px"
                    style={{ background: "linear-gradient(90deg,transparent,#3B82F680,transparent)" }} />

                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                <Trophy size={16} className="text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-base font-black text-white">Edit Tournament</h2>
                                <p className="text-xs text-white/30 truncate max-w-[220px]">{lobby.name}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all">
                            <X size={15} />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className={labelCls}>Name</label>
                            <input className={inputCls} value={form.name} onChange={e => set("name", e.target.value)} />
                        </div>

                        <div>
                            <label className={labelCls}>Description</label>
                            <textarea
                                className="w-full rounded-xl px-3 py-2.5 text-sm outline-none text-white transition-all bg-white/5 border border-white/10 focus:border-[var(--brand-primary)]/50 resize-none"
                                rows={2} value={form.description} onChange={e => set("description", e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className={labelCls}>Game</label>
                                <select className={inputCls + " cursor-pointer"} value={form.game} onChange={e => set("game", e.target.value)}>
                                    <option value="pokemon_showdown">Pokémon Showdown</option>
                                    <option value="league_of_legends">League of Legends</option>
                                    <option value="valorant">Valorant</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelCls}>Status</label>
                                <select className={inputCls + " cursor-pointer"} value={form.status} onChange={e => set("status", e.target.value)}>
                                    {LOBBY_STATUS.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className={labelCls}>Max Participants</label>
                                <input className={inputCls} type="number" min={2} value={form.maxParticipants} onChange={e => set("maxParticipants", e.target.value)} />
                            </div>
                            <div>
                                <label className={labelCls}>Prize Pool</label>
                                <input className={inputCls} value={form.prizePool} onChange={e => set("prizePool", e.target.value)} placeholder="e.g. $500" />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <motion.div className="mt-4 flex items-center gap-2 text-xs text-red-300 bg-red-500/8 border border-red-500/20 rounded-xl px-3 py-2"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <AlertTriangle size={12} /> {error}
                        </motion.div>
                    )}

                    <div className="flex gap-2 mt-6">
                        <button onClick={onClose} disabled={loading}
                            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white/40 hover:text-white border border-white/10 hover:border-white/20 transition-all">
                            Cancel
                        </button>
                        <button onClick={handleSubmit} disabled={loading}
                            className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                            style={{ background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.3)", color: "#3B82F6" }}>
                            {loading ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

// ─── Users table ──────────────────────────────────────────────────────────────

function UsersTable({ users, onEdit, onDelete }: {
    users: User[];
    onEdit: (u: User) => void;
    onDelete: (u: User) => void;
}) {
    const [search, setSearch] = useState("");
    const filtered = users.filter(u =>
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-3">
            <div className="relative">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search users..."
                    className="w-full h-10 pl-9 pr-4 rounded-xl text-sm outline-none text-white bg-white/4 border border-white/8 focus:border-[var(--brand-primary)]/40 transition-all"
                />
            </div>

            <div className="rounded-2xl overflow-hidden border border-white/5">
                {/* Header */}
                <div className="grid px-4 py-3 text-[10px] font-bold tracking-widest uppercase text-white/25 border-b border-white/5"
                    style={{ gridTemplateColumns: "40px 1fr 1fr 100px 90px 90px 80px 80px" }}>
                    <span>#</span>
                    <span>Username</span>
                    <span>Email</span>
                    <span>Rank</span>
                    <span>MMR</span>
                    <span>Status</span>
                    <span>Role</span>
                    <span className="text-right">Actions</span>
                </div>

                <div className="divide-y divide-white/4">
                    <AnimatePresence initial={false}>
                        {filtered.length === 0 ? (
                            <div className="py-12 text-center text-sm text-white/25">No users found</div>
                        ) : filtered.map((user, i) => (
                            <motion.div
                                key={user._id}
                                className="grid px-4 py-3.5 items-center hover:bg-white/3 transition-colors duration-150 group"
                                style={{ gridTemplateColumns: "40px 1fr 1fr 100px 90px 90px 80px 80px" }}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.025 }}
                            >
                                <span className="text-xs text-white/20 font-mono">{i + 1}</span>
                                <div className="min-w-0 pr-2">
                                    <p className="text-sm font-semibold text-white truncate">{user.username}</p>
                                    <p className="text-[10px] text-white/25">{user.role === "ADMIN" ? "Administrator" : "Player"}</p>
                                </div>
                                <p className="text-xs text-white/40 truncate pr-2">{user.email}</p>
                                <div><RankBadge rank={user.rank} /></div>
                                <p className="text-sm font-bold tabular-nums" style={{ color: RANK_COLOR[user.rank] ?? "#888" }}>
                                    {user.mmr.toLocaleString()}
                                </p>
                                <div><StatusBadge status={(user as unknown as Record<string, string>).status ?? "active"} type="user" /></div>
                                <span className={`text-[11px] font-bold ${user.role === "ADMIN" ? "text-[var(--brand-primary)]" : "text-white/30"}`}>
                                    {user.role}
                                </span>
                                <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => onEdit(user)}
                                        className="w-7 h-7 rounded-lg bg-white/5 hover:bg-blue-500/15 hover:text-blue-400 text-white/30 flex items-center justify-center transition-all">
                                        <Pencil size={12} />
                                    </button>
                                    <button onClick={() => onDelete(user)}
                                        className="w-7 h-7 rounded-lg bg-white/5 hover:bg-red-500/15 hover:text-red-400 text-white/30 flex items-center justify-center transition-all">
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
            <p className="text-xs text-white/20 px-1">{filtered.length} of {users.length} users</p>
        </div>
    );
}

// ─── Lobbies table ────────────────────────────────────────────────────────────

function LobbiesTable({ lobbies, onEdit, onDelete }: {
    lobbies: Lobby[];
    onEdit: (l: Lobby) => void;
    onDelete: (l: Lobby) => void;
}) {
    const [search, setSearch]   = useState("");
    const [filter, setFilter]   = useState("all");
    const [showFilter, setShowFilter] = useState(false);
    const filterRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handler(e: MouseEvent) {
            if (filterRef.current && !filterRef.current.contains(e.target as Node)) setShowFilter(false);
        }
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const filtered = lobbies.filter(l => {
        const matchSearch = l.name.toLowerCase().includes(search.toLowerCase());
        const matchFilter = filter === "all" || l.status === filter;
        return matchSearch && matchFilter;
    });

    return (
        <div className="space-y-3">
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tournaments..."
                        className="w-full h-10 pl-9 pr-4 rounded-xl text-sm outline-none text-white bg-white/4 border border-white/8 focus:border-[var(--brand-primary)]/40 transition-all" />
                </div>
                <div className="relative" ref={filterRef}>
                    <button onClick={() => setShowFilter(s => !s)}
                        className="h-10 px-4 rounded-xl text-sm font-semibold text-white/50 hover:text-white bg-white/4 border border-white/8 hover:border-white/16 flex items-center gap-2 transition-all">
                        {filter === "all" ? "All status" : filter.replace("_", " ")}
                        <ChevronDown size={13} className={`transition-transform ${showFilter ? "rotate-180" : ""}`} />
                    </button>
                    <AnimatePresence>
                        {showFilter && (
                            <motion.div className="absolute right-0 top-12 z-50 rounded-xl border border-white/10 overflow-hidden min-w-[160px]"
                                style={{ background: "rgba(14,4,8,0.97)" }}
                                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                                {["all", ...LOBBY_STATUS].map(s => (
                                    <button key={s} onClick={() => { setFilter(s); setShowFilter(false); }}
                                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors capitalize ${filter === s ? "text-white bg-white/8" : "text-white/40 hover:text-white hover:bg-white/4"}`}>
                                        {s.replace("_", " ")}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="rounded-2xl overflow-hidden border border-white/5">
                <div className="grid px-4 py-3 text-[10px] font-bold tracking-widest uppercase text-white/25 border-b border-white/5"
                    style={{ gridTemplateColumns: "40px 1fr 120px 100px 110px 100px 90px 80px" }}>
                    <span>#</span>
                    <span>Tournament</span>
                    <span>Game</span>
                    <span>Participants</span>
                    <span>Status</span>
                    <span>Prize</span>
                    <span>Created</span>
                    <span className="text-right">Actions</span>
                </div>

                <div className="divide-y divide-white/4">
                    <AnimatePresence initial={false}>
                        {filtered.length === 0 ? (
                            <div className="py-12 text-center text-sm text-white/25">No tournaments found</div>
                        ) : filtered.map((lobby, i) => {
                            const game = GAME_CONFIG[lobby.game] ?? { label: lobby.game, color: "#888", Icon: Trophy };
                            const GameIcon = game.Icon;
                            const createdBy = typeof lobby.createdBy === "object" ? lobby.createdBy.username : lobby.createdBy;
                            return (
                                <motion.div
                                    key={lobby._id}
                                    className="grid px-4 py-3.5 items-center hover:bg-white/3 transition-colors duration-150 group"
                                    style={{ gridTemplateColumns: "40px 1fr 120px 100px 110px 100px 90px 80px" }}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.025 }}
                                >
                                    <span className="text-xs text-white/20 font-mono">{i + 1}</span>
                                    <div className="min-w-0 pr-2">
                                        <p className="text-sm font-semibold text-white truncate">{lobby.name}</p>
                                        <p className="text-[10px] text-white/25 truncate">by {createdBy}</p>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <GameIcon size={12} style={{ color: game.color }} />
                                        <span className="text-xs text-white/50 truncate">{game.label.split(" ")[0]}</span>
                                    </div>
                                    <p className="text-sm text-white/60">
                                        <span className="font-bold text-white">{lobby.currentParticipants}</span>
                                        <span className="text-white/30">/{lobby.maxParticipants}</span>
                                    </p>
                                    <div><StatusBadge status={lobby.status} /></div>
                                    <p className="text-xs text-white/50 truncate">{lobby.prizePool || "—"}</p>
                                    <p className="text-xs text-white/30">
                                        {new Date(lobby.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                    </p>
                                    <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => onEdit(lobby)}
                                            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-blue-500/15 hover:text-blue-400 text-white/30 flex items-center justify-center transition-all">
                                            <Pencil size={12} />
                                        </button>
                                        <button onClick={() => onDelete(lobby)}
                                            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-red-500/15 hover:text-red-400 text-white/30 flex items-center justify-center transition-all">
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>
            <p className="text-xs text-white/20 px-1">{filtered.length} of {lobbies.length} tournaments</p>
        </div>
    );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, ok, onDone }: { message: string; ok: boolean; onDone: () => void }) {
    useEffect(() => {
        const t = setTimeout(onDone, 3000);
        return () => clearTimeout(t);
    }, [onDone]);
    return (
        <motion.div
            className={`fixed bottom-6 right-6 z-[90] flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium shadow-2xl ${ok ? "text-green-300" : "text-red-300"}`}
            style={ok
                ? { background: "rgba(10,30,15,0.95)", border: "1px solid rgba(34,197,94,0.3)" }
                : { background: "rgba(30,5,5,0.95)",   border: "1px solid rgba(239,68,68,0.3)"  }}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0,  scale: 1   }}
            exit={{   opacity: 0, y: 20,  scale: 0.9 }}
        >
            {ok ? <Check size={15} /> : <AlertTriangle size={15} />}
            {message}
        </motion.div>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

type Tab = "users" | "lobbies";

export default function Admin() {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [stats,   setStats]   = useState<AdminStats | null>(null);
    const [users,   setUsers]   = useState<User[]>([]);
    const [lobbies, setLobbies] = useState<Lobby[]>([]);
    const [tab, setTab]         = useState<Tab>("users");
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [editUser,   setEditUser]   = useState<User | null | "__create__">(null);
    const [editLobby,  setEditLobby]  = useState<Lobby | null>(null);
    const [deleteUser, setDeleteUser] = useState<User | null>(null);
    const [deleteLobby, setDeleteLobby] = useState<Lobby | null>(null);

    const [toast, setToast] = useState<{ message: string; ok: boolean } | null>(null);

    function showToast(message: string, ok = true) { setToast({ message, ok }); }

    const loadAll = useCallback(async function () {
        try {
            const [s, u, l] = await Promise.all([getAdminStats(), adminGetUsers(), adminGetLobbies()]);
            setStats(s);
            setUsers(u);
            setLobbies(l);
        } catch {
            showToast("Failed to load data", false);
        }
    }, []);

    useEffect(function () {
        (async () => {
            try {
                const { user } = await getProfile();
                if (user.role !== "ADMIN") { navigate("/dashboard"); return; }
                setCurrentUser(user);
                await loadAll();
            } catch {
                logout();
                navigate("/login");
            } finally {
                setLoading(false);
            }
        })();
    }, [navigate, loadAll]);

    async function handleRefresh() {
        setRefreshing(true);
        await loadAll();
        setRefreshing(false);
        showToast("Data refreshed");
    }

    async function handleSaveUser(data: CreateUserPayload | UpdateUserPayload) {
        if (editUser === "__create__") {
            const u = await adminCreateUser(data as CreateUserPayload);
            setUsers(prev => [u, ...prev]);
            showToast("User created");
        } else if (editUser) {
            const u = await adminUpdateUser(editUser._id, data);
            setUsers(prev => prev.map(x => x._id === u._id ? u : x));
            showToast("User updated");
        }
        await loadAll();
    }

    async function handleConfirmDeleteUser() {
        if (!deleteUser) return;
        await adminDeleteUser(deleteUser._id);
        setUsers(prev => prev.filter(u => u._id !== deleteUser._id));
        setDeleteUser(null);
        showToast("User deleted");
        await loadAll();
    }

    async function handleSaveLobby(data: UpdateLobbyPayload) {
        if (!editLobby) return;
        const l = await adminUpdateLobby(editLobby._id, data);
        setLobbies(prev => prev.map(x => x._id === l._id ? l : x));
        showToast("Tournament updated");
        await loadAll();
    }

    async function handleConfirmDeleteLobby() {
        if (!deleteLobby) return;
        await adminDeleteLobby(deleteLobby._id);
        setLobbies(prev => prev.filter(l => l._id !== deleteLobby._id));
        setDeleteLobby(null);
        showToast("Tournament deleted");
        await loadAll();
    }

    if (loading) {
        return (
            <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-[var(--neutral-bg)]">
                <motion.div className="flex flex-col items-center gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="w-10 h-10 rounded-full border-2 border-[var(--brand-primary)]/40 border-t-[var(--brand-primary)] animate-spin" />
                    <p className="text-xs text-white/30 tracking-widest uppercase">Loading admin panel...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="relative bg-[var(--neutral-bg)] text-white min-h-[calc(100vh-64px)]">
            <AdminBackground />

            <div className="relative z-10 pointer-events-auto">
                <div className="max-w-[1512px] mx-auto px-6 md:px-20 pt-10 pb-16 space-y-6">

                    {/* ── Header ── */}
                    <motion.div className="flex flex-col md:flex-row md:items-end justify-between gap-4"
                        initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-7 h-7 rounded-lg bg-[var(--brand-primary)]/15 border border-[var(--brand-primary)]/25 flex items-center justify-center">
                                    <Lock size={13} className="text-[var(--brand-primary)]" />
                                </div>
                                <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-[var(--brand-primary)]/70">Admin Panel</span>
                            </div>
                            <h1 className="text-3xl font-black tracking-tight">Control Center</h1>
                            <p className="text-sm text-white/30 mt-0.5">
                                Logged in as <span className="text-white/60 font-semibold">{currentUser?.username}</span>
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={handleRefresh} disabled={refreshing}
                                className="flex items-center gap-2 h-9 px-4 rounded-xl text-xs font-semibold text-white/40 hover:text-white bg-white/4 border border-white/8 hover:border-white/16 transition-all disabled:opacity-40">
                                <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
                                Refresh
                            </button>
                        </div>
                    </motion.div>

                    {/* ── Stats ── */}
                    {stats && (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { label: "Total Users",    value: stats.totalUsers,    icon: Users,    color: "#dc143c", bg: "rgba(220,20,60,0.15)"   },
                                { label: "Tournaments",    value: stats.totalLobbies,  icon: Trophy,   color: "#3B82F6", bg: "rgba(59,130,246,0.15)"  },
                                { label: "Active Now",     value: stats.activeLobbies, icon: Activity, color: "#22c55e", bg: "rgba(34,197,94,0.15)"   },
                                { label: "Suspended",      value: stats.suspendedUsers,icon: Shield,   color: "#f59e0b", bg: "rgba(245,158,11,0.15)"  },
                            ].map((s, i) => (
                                <motion.div key={s.label} transition={{ delay: i * 0.08 }}>
                                    <StatCard {...s} />
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* ── Tabs ── */}
                    <motion.div className="relative rounded-2xl overflow-hidden border border-white/5"
                        style={{ background: "linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))" }}
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>

                        {/* Tab bar */}
                        <div className="flex items-center justify-between px-6 pt-5 pb-0 border-b border-white/5">
                            <div className="flex items-center gap-1">
                                {([
                                    { key: "users",   label: "Users",       icon: Users,  count: users.length   },
                                    { key: "lobbies", label: "Tournaments", icon: Trophy, count: lobbies.length },
                                ] as { key: Tab; label: string; icon: typeof Users; count: number }[]).map(t => (
                                    <button key={t.key} onClick={() => setTab(t.key)}
                                        className={`relative flex items-center gap-2 px-4 pb-4 pt-1 text-sm font-semibold transition-colors duration-200 ${tab === t.key ? "text-white" : "text-white/30 hover:text-white/60"}`}>
                                        <t.icon size={14} />
                                        {t.label}
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold transition-all ${tab === t.key ? "bg-[var(--brand-primary)]/20 text-[var(--brand-primary)]" : "bg-white/5 text-white/25"}`}>
                                            {t.count}
                                        </span>
                                        {tab === t.key && (
                                            <motion.div layoutId="tab-indicator"
                                                className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
                                                style={{ background: "var(--brand-primary)" }} />
                                        )}
                                    </button>
                                ))}
                            </div>

                            {tab === "users" && (
                                <button onClick={() => setEditUser("__create__")}
                                    className="flex items-center gap-2 h-8 px-3.5 rounded-lg text-xs font-bold transition-all mb-3"
                                    style={{ background: "rgba(220,20,60,0.12)", border: "1px solid rgba(220,20,60,0.3)", color: "#dc143c" }}>
                                    <Plus size={13} /> Create User
                                </button>
                            )}
                        </div>

                        {/* Tab content */}
                        <div className="p-6">
                            <AnimatePresence mode="wait">
                                <motion.div key={tab}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.25 }}>
                                    {tab === "users" ? (
                                        <UsersTable
                                            users={users}
                                            onEdit={u => setEditUser(u)}
                                            onDelete={u => setDeleteUser(u)}
                                        />
                                    ) : (
                                        <LobbiesTable
                                            lobbies={lobbies}
                                            onEdit={l => setEditLobby(l)}
                                            onDelete={l => setDeleteLobby(l)}
                                        />
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </motion.div>

                </div>
            </div>

            {/* ── Modals ── */}
            <AnimatePresence>
                {(editUser !== null) && (
                    <UserModal
                        user={editUser === "__create__" ? null : editUser}
                        onSave={handleSaveUser}
                        onClose={() => setEditUser(null)}
                    />
                )}
                {editLobby && (
                    <LobbyModal
                        lobby={editLobby}
                        onSave={handleSaveLobby}
                        onClose={() => setEditLobby(null)}
                    />
                )}
                {deleteUser && (
                    <ConfirmDialog
                        message={`Delete user "${deleteUser.username}"? This is permanent.`}
                        onConfirm={handleConfirmDeleteUser}
                        onCancel={() => setDeleteUser(null)}
                    />
                )}
                {deleteLobby && (
                    <ConfirmDialog
                        message={`Delete tournament "${deleteLobby.name}"? This is permanent.`}
                        onConfirm={handleConfirmDeleteLobby}
                        onCancel={() => setDeleteLobby(null)}
                    />
                )}
                {toast && (
                    <Toast message={toast.message} ok={toast.ok} onDone={() => setToast(null)} />
                )}
            </AnimatePresence>
        </div>
    );
}
