import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, Pencil, Trash2, Trophy } from "lucide-react";
import type { Lobby } from "../../types";
import { GAME_CONFIG, LOBBY_STATUS } from "./adminConstants";
import StatusBadge from "./StatusBadge";

interface LobbiesTableProps {
    lobbies: Lobby[];
    onEdit: (l: Lobby) => void;
    onDelete: (l: Lobby) => void;
}

export default function LobbiesTable({ lobbies, onEdit, onDelete }: LobbiesTableProps) {
    const [search, setSearch]         = useState("");
    const [filter, setFilter]         = useState("all");
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
                    <span>#</span><span>Tournament</span><span>Game</span><span>Participants</span>
                    <span>Status</span><span>Prize</span><span>Created</span><span className="text-right">Actions</span>
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
