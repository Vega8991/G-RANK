import { useState } from "react";
import { motion } from "framer-motion";
import { AxiosError } from "axios";
import { AlertTriangle, Users, X } from "lucide-react";
import type { User } from "../../types";
import type { CreateUserPayload, UpdateUserPayload } from "../../services/adminService";
import { RANKS } from "./adminConstants";

interface UserModalProps {
    user: User | null;
    onSave: (data: CreateUserPayload | UpdateUserPayload) => Promise<void>;
    onClose: () => void;
}

export default function UserModal({ user, onSave, onClose }: UserModalProps) {
    const isCreate = !user;
    const [form, setForm] = useState({
        username: user?.username ?? "",
        email:    user?.email    ?? "",
        password: "",
        role:     user?.role     ?? "USER",
        rank:     user?.rank     ?? "Bronze",
        mmr:      String(user?.mmr ?? 250),
        status:   user?.status ?? "active",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState<string | null>(null);

    function setField(key: string, value: string) {
        setForm(prev => ({ ...prev, [key]: value }));
    }

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

    const inputCls = "w-full h-10 rounded-xl px-3 text-sm outline-none text-white transition-all bg-white/5 border border-white/10 focus:border-[var(--brand-primary)]/50 focus:bg-white/8";
    const labelCls = "block text-[10px] font-bold tracking-widest uppercase text-white/30 mb-1.5";

    return (
        <motion.div className="fixed inset-0 z-[70] flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
            <motion.div
                className="relative z-10 rounded-2xl w-full max-w-lg border border-white/8 overflow-hidden max-h-[92vh] overflow-y-auto"
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className={labelCls}>Username</label>
                                <input className={inputCls} value={form.username} onChange={e => setField("username", e.target.value)} placeholder="ProPlayer" />
                            </div>
                            <div>
                                <label className={labelCls}>Email</label>
                                <input className={inputCls} type="email" value={form.email} onChange={e => setField("email", e.target.value)} placeholder="user@email.com" />
                            </div>
                        </div>

                        <div>
                            <label className={labelCls}>{isCreate ? "Password" : "New Password (leave blank to keep)"}</label>
                            <input className={inputCls} type="password" value={form.password} onChange={e => setField("password", e.target.value)} placeholder={isCreate ? "Min 6 characters" : "Leave blank to keep current"} />
                        </div>

                        <div className="grid grid-cols-3 sm:grid-cols-3 gap-3">
                            <div>
                                <label className={labelCls}>Role</label>
                                <select className={inputCls + " cursor-pointer"} value={form.role} onChange={e => setField("role", e.target.value)}>
                                    <option value="USER" style={{ background: '#1a1a1a', color: '#ffffff' }}>User</option>
                                    <option value="ADMIN" style={{ background: '#1a1a1a', color: '#ffffff' }}>Admin</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelCls}>Rank</label>
                                <select className={inputCls + " cursor-pointer"} value={form.rank} onChange={e => setField("rank", e.target.value)}>
                                    {RANKS.map(r => <option key={r} value={r} style={{ background: '#1a1a1a', color: '#ffffff' }}>{r}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={labelCls}>Status</label>
                                <select className={inputCls + " cursor-pointer"} value={form.status} onChange={e => setField("status", e.target.value)}>
                                    <option value="active" style={{ background: '#1a1a1a', color: '#ffffff' }}>Active</option>
                                    <option value="suspended" style={{ background: '#1a1a1a', color: '#ffffff' }}>Suspended</option>
                                    <option value="banned" style={{ background: '#1a1a1a', color: '#ffffff' }}>Banned</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className={labelCls}>MMR</label>
                            <input className={inputCls} type="number" min={0} value={form.mmr} onChange={e => setField("mmr", e.target.value)} placeholder="250" />
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
