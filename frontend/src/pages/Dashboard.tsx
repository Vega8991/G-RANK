import { motion, AnimatePresence } from "framer-motion";
import { Trophy, TrendingUp, TrendingDown, Zap, Flame, Mail, Calendar, LogOut, BarChart3, Percent, Award, Star, Gem, Crown } from "lucide-react";
import { NavLink } from "react-router-dom";
import Button from "../components/common/Button";
import DashboardBackground from "../components/dashboard/DashboardBackground";
import StatCard from "../components/dashboard/StatCard";
import MmrProgressCard from "../components/dashboard/MmrProgressCard";
import RiotAccountCard from "../components/dashboard/RiotAccountCard";
import RecentLobbiesCard from "../components/dashboard/RecentLobbiesCard";
import DashboardFooter from "../components/dashboard/DashboardFooter";
import { useDashboard } from "../hooks/useDashboard";

const RANK_CONFIG = {
    Bronze:   { color: "#cd7f32", glow: "rgba(205,127,50,0.35)",  Icon: Award  },
    Silver:   { color: "#c0c0c0", glow: "rgba(192,192,192,0.30)", Icon: Star   },
    Gold:     { color: "#ffd700", glow: "rgba(255,215,0,0.35)",   Icon: Trophy },
    Platinum: { color: "#e5e4e2", glow: "rgba(229,228,226,0.30)", Icon: Gem    },
    Diamond:  { color: "#b9f2ff", glow: "rgba(185,242,255,0.30)", Icon: Gem    },
    Master:   { color: "#9b30ff", glow: "rgba(155,48,255,0.35)",  Icon: Crown  },
    Elite:    { color: "#dc143c", glow: "rgba(220,20,60,0.40)",   Icon: Flame  },
} as const;

type RankName = keyof typeof RANK_CONFIG;

function getRankCfg(rank: string) {
    return RANK_CONFIG[rank as RankName] ?? RANK_CONFIG.Bronze;
}

export default function Dashboard() {
    const { user, lobbies, loadError, oauthMsg, setOauthMsg, loadProfile, handleLogout } = useDashboard();

    if (!user) {
        return (
            <div className="min-h-[calc(100vh-64px)] bg-[var(--neutral-bg)] flex items-center justify-center">
                {loadError ? (
                    <div className="text-center space-y-3">
                        <p className="text-sm text-white/40">Failed to load profile</p>
                        <button
                            onClick={() => { void loadProfile(); }}
                            className="text-xs text-[var(--brand-primary)] hover:underline"
                        >
                            Retry
                        </button>
                    </div>
                ) : (
                    <motion.div className="flex flex-col items-center gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="w-10 h-10 rounded-full border-2 border-[var(--brand-primary)]/40 border-t-[var(--brand-primary)] animate-spin" />
                        <p className="text-xs text-white/30 tracking-widest uppercase">Loading profile...</p>
                    </motion.div>
                )}
            </div>
        );
    }

    const rankCfg  = getRankCfg(user.rank);
    const RankIcon = rankCfg.Icon;
    const wins      = user.wins      ?? 0;
    const losses    = user.losses    ?? 0;
    const winRate   = user.winRate   ?? 0;
    const winStreak = user.winStreak ?? 0;
    const initial   = user.username.charAt(0).toUpperCase();

    return (
        <div className="relative bg-[var(--neutral-bg)] text-white min-h-[calc(100vh-64px)]">
            <DashboardBackground />

            <div className="relative z-10 pointer-events-auto">
                <div className="max-w-[1512px] mx-auto px-4 md:px-20 pt-8 md:pt-12 pb-16 space-y-5">

                    <AnimatePresence>
                        {oauthMsg && (
                            <motion.div
                                className={"flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium " + (oauthMsg.ok ? "text-green-300" : "text-red-300")}
                                style={oauthMsg.ok
                                    ? { border: "1px solid rgba(34,197,94,0.25)", background: "rgba(34,197,94,0.08)" }
                                    : { border: "1px solid rgba(239,68,68,0.25)", background: "rgba(239,68,68,0.08)" }}
                                initial={{ opacity: 0, y: -12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -12 }}
                                transition={{ duration: 0.35 }}
                            >
                                {oauthMsg.text}
                                <button onClick={() => setOauthMsg(null)} className="ml-auto text-xs opacity-40 hover:opacity-80 transition-opacity">✕</button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <motion.div
                        className="relative rounded-2xl overflow-hidden"
                        initial={{ opacity: 0, y: 28 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent 0%, ${rankCfg.color} 30%, ${rankCfg.color} 70%, transparent 100%)` }} />
                        <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-[120px] pointer-events-none opacity-15" style={{ background: rankCfg.color, transform: "translate(30%, -30%)" }} />
                        <div className="absolute inset-0 border border-white/5 backdrop-blur-xl" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)" }} />

                        <div className="relative z-10 p-8">
                            <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/20 mb-6">Player Profile</p>
                            <div className="flex flex-col md:flex-row md:items-center gap-8">
                                <div className="relative shrink-0">
                                    <div
                                        className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black"
                                        style={{
                                            background: `linear-gradient(135deg, ${rankCfg.color}25, ${rankCfg.color}08)`,
                                            border: `1px solid ${rankCfg.color}40`,
                                            boxShadow: `0 0 40px ${rankCfg.glow}`
                                        }}
                                    >
                                        {initial}
                                    </div>
                                    <div
                                        className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg flex items-center justify-center"
                                        style={{ backgroundColor: rankCfg.color, boxShadow: `0 0 16px ${rankCfg.glow}` }}
                                    >
                                        <RankIcon size={13} className="text-white" />
                                    </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <h1 className="text-3xl md:text-4xl font-black tracking-tight">{user.username}</h1>
                                        {user.role === "ADMIN" && (
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider" style={{ background: "rgba(220,20,60,0.15)", border: "1px solid rgba(220,20,60,0.3)", color: "var(--brand-primary)" }}>Admin</span>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-xs text-white/30">
                                        <span className="flex items-center gap-1.5"><Mail size={11} /> {user.email}</span>
                                        <span className="flex items-center gap-1.5"><Calendar size={11} /> Joined {new Date(user.joinDate ?? Date.now()).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 shrink-0">
                                    <div className="text-center">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: rankCfg.color + "18" }}>
                                                <RankIcon size={16} style={{ color: rankCfg.color }} />
                                            </div>
                                            <span className="text-xl font-black" style={{ color: rankCfg.color }}>{user.rank}</span>
                                        </div>
                                        <p className="text-[10px] text-white/30 tracking-widest uppercase">Rank</p>
                                    </div>
                                    <div className="w-px h-10 bg-white/8" />
                                    <div className="text-center">
                                        <p className="text-3xl font-black text-[var(--brand-primary)] tabular-nums">{user.mmr.toLocaleString()}</p>
                                        <p className="text-[10px] text-white/30 tracking-widest uppercase">MMR</p>
                                    </div>
                                    <div className="w-px h-10 bg-white/8" />
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white/30 transition-all duration-200 hover:text-red-400"
                                        style={{ border: "1px solid rgba(255,255,255,0.08)" }}
                                    >
                                        <LogOut size={13} />
                                        Sign out
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard label="Wins" value={wins} icon={TrendingUp} color="var(--status-success)" bg="rgba(34,197,94,0.15)" delay={0} />
                        <StatCard label="Losses" value={losses} icon={TrendingDown} color="#ef4444" bg="rgba(239,68,68,0.15)" delay={80} />
                        <StatCard label="Win Rate" value={parseFloat(String(winRate))} icon={Percent} color="var(--status-warning)" bg="rgba(245,158,11,0.15)" suffix="%" delay={160} decimals={1} />
                        <StatCard label="Win Streak" value={winStreak} icon={winStreak >= 3 ? Flame : Zap} color={winStreak >= 3 ? "#dc143c" : "#9b30ff"} bg={winStreak >= 3 ? "rgba(220,20,60,0.15)" : "rgba(155,48,255,0.15)"} delay={240} />
                    </div>

                    <MmrProgressCard user={user} />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        <RecentLobbiesCard lobbies={lobbies} />
                        <RiotAccountCard user={user} onUpdate={loadProfile} />
                    </div>

                    <motion.div
                        className="flex flex-wrap gap-3"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.75, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <NavLink to="/lobbies">
                            <Button className="px-6 py-2.5 text-sm">
                                <Trophy size={15} /> Browse Lobbies
                            </Button>
                        </NavLink>
                        <NavLink to="/leaderboard">
                            <Button variant="outline" className="px-6 py-2.5 text-sm">
                                <BarChart3 size={15} /> View Leaderboard
                            </Button>
                        </NavLink>
                    </motion.div>

                </div>

                <DashboardFooter />
            </div>
        </div>
    );
}
