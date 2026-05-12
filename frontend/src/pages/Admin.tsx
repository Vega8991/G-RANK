import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Trophy, Shield, Activity, Lock, RefreshCw, Plus } from "lucide-react";
import { useAdmin } from "../hooks/useAdmin";
import type { User, Lobby } from "../types";
import type { CreateUserPayload, UpdateUserPayload, UpdateLobbyPayload } from "../services/adminService";
import AdminBackground from "../components/admin/AdminBackground";
import StatCard from "../components/admin/StatCard";
import ConfirmDialog from "../components/admin/ConfirmDialog";
import UserModal from "../components/admin/UserModal";
import LobbyModal from "../components/admin/LobbyModal";
import UsersTable from "../components/admin/UsersTable";
import LobbiesTable from "../components/admin/LobbiesTable";
import AdminToast from "../components/admin/AdminToast";

type Tab = "users" | "lobbies";

export default function Admin() {
    const {
        currentUser, stats, users, lobbies, loading, toast, setToast,
        handleSaveUser, handleDeleteUser, handleSaveLobby, handleDeleteLobby, handleRefresh,
    } = useAdmin();

    const [tab, setTab]             = useState<Tab>("users");
    const [editUser, setEditUser]   = useState<User | "__create__" | null>(null);
    const [editLobby, setEditLobby] = useState<Lobby | null>(null);
    const [deleteUser, setDeleteUser]   = useState<User | null>(null);
    const [deleteLobby, setDeleteLobby] = useState<Lobby | null>(null);
    const [refreshing, setRefreshing]   = useState(false);

    async function onRefresh() {
        setRefreshing(true);
        await handleRefresh();
        setRefreshing(false);
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
                        <button onClick={onRefresh} disabled={refreshing}
                            className="flex items-center gap-2 h-9 px-4 rounded-xl text-xs font-semibold text-white/40 hover:text-white bg-white/4 border border-white/8 hover:border-white/16 transition-all disabled:opacity-40">
                            <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
                            Refresh
                        </button>
                    </motion.div>

                    {stats && (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { label: "Total Users",  value: stats.totalUsers,     icon: Users,    color: "#dc143c", bg: "rgba(220,20,60,0.15)"  },
                                { label: "Tournaments",  value: stats.totalLobbies,   icon: Trophy,   color: "#3B82F6", bg: "rgba(59,130,246,0.15)" },
                                { label: "Active Now",   value: stats.activeLobbies,  icon: Activity, color: "#22c55e", bg: "rgba(34,197,94,0.15)"  },
                                { label: "Suspended",    value: stats.suspendedUsers, icon: Shield,   color: "#f59e0b", bg: "rgba(245,158,11,0.15)" },
                            ].map((s, i) => (
                                <motion.div key={s.label} transition={{ delay: i * 0.08 }}>
                                    <StatCard {...s} />
                                </motion.div>
                            ))}
                        </div>
                    )}

                    <motion.div className="relative rounded-2xl overflow-hidden border border-white/5"
                        style={{ background: "linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))" }}
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>

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

                        <div className="p-6">
                            <AnimatePresence mode="wait">
                                <motion.div key={tab}
                                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                                    {tab === "users" ? (
                                        <UsersTable users={users} onEdit={u => setEditUser(u)} onDelete={u => setDeleteUser(u)} />
                                    ) : (
                                        <LobbiesTable lobbies={lobbies} onEdit={l => setEditLobby(l)} onDelete={l => setDeleteLobby(l)} />
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </motion.div>

                </div>
            </div>

            <AnimatePresence>
                {editUser !== null && (
                    <UserModal
                        user={editUser === "__create__" ? null : editUser}
                        onSave={(data: CreateUserPayload | UpdateUserPayload) => handleSaveUser(editUser, data)}
                        onClose={() => setEditUser(null)}
                    />
                )}
                {editLobby && (
                    <LobbyModal
                        lobby={editLobby}
                        onSave={(data: UpdateLobbyPayload) => handleSaveLobby(editLobby, data)}
                        onClose={() => setEditLobby(null)}
                    />
                )}
                {deleteUser && (
                    <ConfirmDialog
                        message={`Delete user "${deleteUser.username}"? This is permanent.`}
                        onConfirm={async () => { await handleDeleteUser(deleteUser); setDeleteUser(null); }}
                        onCancel={() => setDeleteUser(null)}
                    />
                )}
                {deleteLobby && (
                    <ConfirmDialog
                        message={`Delete tournament "${deleteLobby.name}"? This is permanent.`}
                        onConfirm={async () => { await handleDeleteLobby(deleteLobby); setDeleteLobby(null); }}
                        onCancel={() => setDeleteLobby(null)}
                    />
                )}
                {toast && (
                    <AdminToast message={toast.message} ok={toast.ok} onDone={() => setToast(null)} />
                )}
            </AnimatePresence>
        </div>
    );
}
