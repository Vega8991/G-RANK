import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import type { User } from "../../types";
import { RANK_COLOR } from "./adminConstants";
import RankBadge from "./RankBadge";
import StatusBadge from "./StatusBadge";

interface UsersTableProps {
    users: User[];
    onEdit: (u: User) => void;
    onDelete: (u: User) => void;
}

const PAGE_SIZE = 8;

function Pagination({ page, total, onChange }: { page: number; total: number; onChange: (p: number) => void }) {
    if (total <= 1) return null;
    const pages = Array.from({ length: total }, (_, i) => i + 1);
    const visible = pages.filter(p => p === 1 || p === total || Math.abs(p - page) <= 1);

    return (
        <div className="flex items-center justify-center gap-1 pt-2">
            <button
                onClick={() => onChange(page - 1)} disabled={page === 1}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/8 disabled:opacity-25 disabled:cursor-not-allowed transition-all">
                <ChevronLeft size={14} />
            </button>
            {visible.map((p, i) => {
                const prev = visible[i - 1];
                return (
                    <span key={p} className="flex items-center gap-1">
                        {prev && p - prev > 1 && <span className="text-white/20 text-xs px-1">…</span>}
                        <button
                            onClick={() => onChange(p)}
                            className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${p === page
                                ? "bg-[var(--brand-primary)]/20 text-[var(--brand-primary)] border border-[var(--brand-primary)]/30"
                                : "text-white/30 hover:text-white hover:bg-white/8"}`}>
                            {p}
                        </button>
                    </span>
                );
            })}
            <button
                onClick={() => onChange(page + 1)} disabled={page === total}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/8 disabled:opacity-25 disabled:cursor-not-allowed transition-all">
                <ChevronRight size={14} />
            </button>
        </div>
    );
}

export default function UsersTable({ users, onEdit, onDelete }: UsersTableProps) {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    const filtered = users.filter(u =>
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => { setPage(1); }, [search]);

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
                <div className="grid px-4 py-3 text-[10px] font-bold tracking-widest uppercase text-white/25 border-b border-white/5 [grid-template-columns:40px_1fr_90px_72px] md:[grid-template-columns:40px_1fr_100px_90px_90px_80px_72px]">
                    <span>#</span>
                    <span>Username</span>
                    <span>Rank</span>
                    <span className="hidden md:block">MMR</span>
                    <span className="hidden md:block">Status</span>
                    <span className="hidden md:block">Role</span>
                    <span className="text-right">Actions</span>
                </div>

                <div className="divide-y divide-white/4">
                    <AnimatePresence initial={false}>
                        {paginated.length === 0 ? (
                            <div className="py-12 text-center text-sm text-white/25">No users found</div>
                        ) : paginated.map((user, i) => (
                            <motion.div
                                key={user._id}
                                className="grid px-4 py-3.5 items-center hover:bg-white/3 transition-colors duration-150 group [grid-template-columns:40px_1fr_90px_72px] md:[grid-template-columns:40px_1fr_100px_90px_90px_80px_72px]"
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.02 }}
                            >
                                <span className="text-xs text-white/20 font-mono">{(page - 1) * PAGE_SIZE + i + 1}</span>
                                <div className="min-w-0 pr-2">
                                    <p className="text-xs font-semibold text-white truncate">{user.username}</p>
                                    <p className="text-[10px] text-white/25">{user.role === "ADMIN" ? "Administrator" : "Player"}</p>
                                </div>
                                <div><RankBadge rank={user.rank} /></div>
                                <p className="hidden md:block text-sm font-bold tabular-nums" style={{ color: RANK_COLOR[user.rank] ?? "#888" }}>
                                    {user.mmr.toLocaleString()}
                                </p>
                                <div className="hidden md:block">
                                    <StatusBadge status={(user as unknown as Record<string, string>).status ?? "active"} type="user" />
                                </div>
                                <span className={`hidden md:block text-[11px] font-bold ${user.role === "ADMIN" ? "text-[var(--brand-primary)]" : "text-white/30"}`}>
                                    {user.role}
                                </span>
                                <div className="sticky right-0 flex items-center justify-end gap-1.5 md:opacity-0 md:group-hover:opacity-100 transition-opacity" style={{ background: "inherit" }}>
                                    <button onClick={() => onEdit(user)}
                                        className="w-7 h-7 rounded-lg bg-white/10 hover:bg-blue-500/15 hover:text-blue-400 text-white/50 flex items-center justify-center transition-all">
                                        <Pencil size={12} />
                                    </button>
                                    <button onClick={() => onDelete(user)}
                                        className="w-7 h-7 rounded-lg bg-white/10 hover:bg-red-500/15 hover:text-red-400 text-white/50 flex items-center justify-center transition-all">
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            <div className="flex items-center justify-between px-1">
                <p className="text-xs text-white/20">{filtered.length} users</p>
                <Pagination page={page} total={totalPages} onChange={setPage} />
            </div>
        </div>
    );
}
