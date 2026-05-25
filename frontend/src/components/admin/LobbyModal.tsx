import { useState } from "react";
import { motion } from "framer-motion";
import { AxiosError } from "axios";
import { AlertTriangle, Trophy, X } from "lucide-react";
import type { Lobby } from "../../types";
import type { UpdateLobbyPayload } from "../../services/adminService";
import { LOBBY_STATUS } from "./adminConstants";

interface LobbyModalProps {
    lobby: Lobby;
    onSave: (data: UpdateLobbyPayload) => Promise<void>;
    onClose: () => void;
}

export default function LobbyModal({ lobby, onSave, onClose }: LobbyModalProps) {
    const [form, setForm] = useState({
        name:            lobby.name,
        description:     lobby.description,
        game:            lobby.game,
        maxParticipants: String(lobby.maxParticipants),
        status:          lobby.status,
        prizePool:       lobby.prizePool ?? "",
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

    const inputCls = "w-full h-10 rounded-xl px-3 text-sm outline-none text-white transition-all bg-white/5 border border-white/10 focus:border-[var(--brand-primary)]/50";
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
                            <input className={inputCls} value={form.name} onChange={e => setField("name", e.target.value)} />
                        </div>
                        <div>
                            <label className={labelCls}>Description</label>
                            <textarea
                                className="w-full rounded-xl px-3 py-2.5 text-sm outline-none text-white transition-all bg-white/5 border border-white/10 focus:border-[var(--brand-primary)]/50 resize-none"
                                rows={2} value={form.description} onChange={e => setField("description", e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className={labelCls}>Game</label>
                                <select className={inputCls + " cursor-pointer"} value={form.game} onChange={e => setField("game", e.target.value)}>
                                    <option value="pokemon_showdown">Pokémon Showdown</option>
                                    <option value="league_of_legends">League of Legends</option>
                                    <option value="valorant">Valorant</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelCls}>Status</label>
                                <select className={inputCls + " cursor-pointer"} value={form.status} onChange={e => setField("status", e.target.value)}>
                                    {LOBBY_STATUS.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className={labelCls}>Max Participants</label>
                                <input className={inputCls} type="number" min={2} value={form.maxParticipants} onChange={e => setField("maxParticipants", e.target.value)} />
                            </div>
                            <div>
                                <label className={labelCls}>Prize Pool</label>
                                <input className={inputCls} value={form.prizePool} onChange={e => setField("prizePool", e.target.value)} placeholder="e.g. $500" />
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
