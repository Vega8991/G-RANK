import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Pencil, Trash2 } from "lucide-react";
import type { User } from "../../types";
import { RANK_COLOR } from "./adminConstants";
import RankBadge from "./RankBadge";
import StatusBadge from "./StatusBadge";

interface UsersTableProps {
    users: User[];
    onEdit: (u: User) => void;
    onDelete: (u: User) => void;
}

export default function UsersTable({ users, onEdit, onDelete }: UsersTableProps) {
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
                <div className="grid px-4 py-3 text-[10px] font-bold tracking-widest uppercase text-white/25 border-b border-white/5"
                    style={{ gridTemplateColumns: "40px 1fr 1fr 100px 90px 90px 80px 80px" }}>
                    <span>#</span><span>Username</span><span>Email</span><span>Rank</span>
                    <span>MMR</span><span>Status</span><span>Role</span><span className="text-right">Actions</span>
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
