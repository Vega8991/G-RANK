import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, NavLink, useSearchParams } from "react-router-dom";
import { AxiosError } from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
    Trophy, TrendingUp, TrendingDown, Zap, Flame, Crown, Star, Gem, Award,
    Mail, Calendar, Shield, LogOut, Unlink,
    CheckCircle, AlertCircle, Swords, Crosshair, ChevronRight, BarChart3,
    Percent, Sparkles
} from "lucide-react";
import Silk from "../components/ui/Silk";
import Button from "../components/common/Button";
import { getProfile, logout } from "../services/authService";
import { getMyLobbies } from "../services/lobbyService";
import { linkRiotAccount, unlinkRiotAccount, getMyRiotProfile } from "../services/riotService";
import type { User, Lobby, RiotPlatform } from "../types";

// ─── Rank system ───────────────────────────────────────────────────────────────

const RANK_CONFIG = {
    Bronze:   { color: "#cd7f32", glow: "rgba(205,127,50,0.35)",  Icon: Award,  min: 0,    max: 499,      next: "Silver",   nextMin: 500  },
    Silver:   { color: "#c0c0c0", glow: "rgba(192,192,192,0.30)", Icon: Star,   min: 500,  max: 999,      next: "Gold",     nextMin: 1000 },
    Gold:     { color: "#ffd700", glow: "rgba(255,215,0,0.35)",   Icon: Trophy, min: 1000, max: 1499,     next: "Platinum", nextMin: 1500 },
    Platinum: { color: "#e5e4e2", glow: "rgba(229,228,226,0.30)", Icon: Gem,    min: 1500, max: 1999,     next: "Diamond",  nextMin: 2000 },
    Diamond:  { color: "#b9f2ff", glow: "rgba(185,242,255,0.30)", Icon: Gem,    min: 2000, max: 2499,     next: "Master",   nextMin: 2500 },
    Master:   { color: "#9b30ff", glow: "rgba(155,48,255,0.35)",  Icon: Crown,  min: 2500, max: 2999,     next: "Elite",    nextMin: 3000 },
    Elite:    { color: "#dc143c", glow: "rgba(220,20,60,0.40)",   Icon: Flame,  min: 3000, max: Infinity, next: null,       nextMin: null }
} as const;

type RankName = keyof typeof RANK_CONFIG;

function getRankCfg(rank: string) {
    return RANK_CONFIG[rank as RankName] ?? RANK_CONFIG.Bronze;
}

function getRankProgress(mmr: number, rank: string): number {
    const cfg = getRankCfg(rank);
    if (cfg.max === Infinity) return 100;
    const range = cfg.max - cfg.min + 1;
    return Math.min(100, Math.max(0, ((mmr - cfg.min) / range) * 100));
}

// ─── Riot platforms ────────────────────────────────────────────────────────────

const RIOT_PLATFORMS: { value: RiotPlatform; label: string }[] = [
    { value: "na1",  label: "North America (NA)"          },
    { value: "euw1", label: "Europe West (EUW)"           },
    { value: "eun1", label: "Europe Nordic & East (EUNE)" },
    { value: "kr",   label: "Korea (KR)"                  },
    { value: "br1",  label: "Brazil (BR)"                 },
    { value: "la1",  label: "Latin America (LAN)"         },
    { value: "la2",  label: "Latin America South (LAS)"   },
    { value: "jp1",  label: "Japan (JP)"                  },
    { value: "oc1",  label: "Oceania (OCE)"               },
    { value: "tr1",  label: "Turkey (TR)"                 },
    { value: "ru",   label: "Russia (RU)"                 },
];

// ─── Animated counter hook ─────────────────────────────────────────────────────

function useCountUp(target: number, duration = 1100, delay = 0): number {
    const [count, setCount] = useState(0);
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        const timeout = setTimeout(function () {
            const startTime = performance.now();
            function tick(now: number) {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                setCount(Math.round(target * eased));
                if (progress < 1) {
                    rafRef.current = requestAnimationFrame(tick);
                }
            }
            rafRef.current = requestAnimationFrame(tick);
        }, delay);
        return function () {
            clearTimeout(timeout);
            if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
        };
    }, [target, duration, delay]);

    return count;
}

// ─── Background ───────────────────────────────────────────────────────────────

const DashboardBackground = memo(function DashboardBackground() {
    return (
        <div className="fixed inset-0 z-0 w-screen h-screen overflow-hidden">
            <Silk speed={2.2} scale={1.5} color="#2a0810" noiseIntensity={0.9} rotation={0.6} />
            <div className="pointer-events-none absolute inset-0 bg-black/35" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_15%,rgba(220,20,60,0.28),transparent_50%),radial-gradient(circle_at_75%_75%,rgba(155,48,255,0.14),transparent_50%),radial-gradient(circle_at_60%_10%,rgba(220,20,60,0.12),transparent_40%)]" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-[var(--neutral-bg)]" />
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.025]"
                style={{
                    backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.8) 2px, rgba(255,255,255,0.8) 3px)",
                    backgroundSize: "100% 3px"
                }}
            />
        </div>
    );
});

// ─── Stat card ────────────────────────────────────────────────────────────────

interface StatCardProps {
    label: string;
    value: number;
    icon: typeof Trophy;
    color: string;
    bg: string;
    suffix?: string;
    delay?: number;
    decimals?: number;
}

function StatCard({ label, value, icon: Icon, color, bg, suffix = "", delay = 0, decimals = 0 }: StatCardProps) {
    const count = useCountUp(value, 1100, delay);
    const display = decimals > 0 ? count.toFixed(decimals) : count.toLocaleString();

    return (
        <motion.div
            className="group relative rounded-2xl overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 + delay / 1000, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -4, boxShadow: `0 24px 60px ${bg}` }}
        >
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${color}80, transparent)` }} />

            <div
                className="relative p-6 h-full border border-white/5 backdrop-blur-xl"
                style={{ background: `linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)` }}
            >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `radial-gradient(circle at 50% 0%, ${bg} 0%, transparent 70%)` }} />

                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-5">
                        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/30">{label}</p>
                        <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                            style={{ backgroundColor: bg, border: `1px solid ${color}30` }}
                        >
                            <Icon size={17} style={{ color }} />
                        </div>
                    </div>
                    <p className="text-4xl font-black tabular-nums tracking-tight" style={{ color }}>
                        {display}{suffix}
                    </p>
                </div>
            </div>
        </motion.div>
    );
}

// ─── MMR Progress card ────────────────────────────────────────────────────────

function MmrProgressCard({ user }: { user: User }) {
    const rankCfg = getRankCfg(user.rank);
    const RankIcon = rankCfg.Icon;
    const progress = getRankProgress(user.mmr, user.rank);
    const isMax = rankCfg.max === Infinity;
    const mmrToNext = isMax ? null : rankCfg.max + 1 - user.mmr;
    const nextCfg = rankCfg.next ? getRankCfg(rankCfg.next) : null;
    const NextIcon = nextCfg?.Icon;

    return (
        <motion.div
            className="relative rounded-2xl overflow-hidden"
            initial={{ opacity: 0, y: 30, scaleY: 0.96 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            style={{ originY: 0 }}
            transition={{ duration: 0.8, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -2, boxShadow: `0 24px 60px ${rankCfg.glow}` }}
        >
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${rankCfg.color}60, transparent)` }} />
            <div className="absolute inset-0 border border-white/5 backdrop-blur-xl rounded-2xl" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)" }} />

            <div className="relative z-10 p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <BarChart3 size={16} className="text-[var(--brand-primary)]" />
                        <span className="text-xs font-bold tracking-[0.15em] uppercase text-white/50">Rank Progress</span>
                    </div>
                    <span className="text-xs font-bold tabular-nums" style={{ color: rankCfg.color }}>{user.mmr.toLocaleString()} MMR</span>
                </div>

                <div className="flex items-center gap-4 mb-5">
                    <div className="flex items-center gap-2 shrink-0">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: rankCfg.color + "20", border: `1px solid ${rankCfg.color}30` }}>
                            <RankIcon size={16} style={{ color: rankCfg.color }} />
                        </div>
                        <span className="text-sm font-black" style={{ color: rankCfg.color }}>{user.rank}</span>
                    </div>

                    <div className="flex-1 relative h-3 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                        <motion.div
                            className="h-full rounded-full relative"
                            style={{ background: `linear-gradient(90deg, ${rankCfg.color}80, ${rankCfg.color})` }}
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1.2, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg" style={{ border: `2px solid ${rankCfg.color}` }} />
                        </motion.div>
                    </div>

                    {nextCfg && NextIcon ? (
                        <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs text-white/30">{rankCfg.next}</span>
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center opacity-40" style={{ backgroundColor: nextCfg.color + "20" }}>
                                <NextIcon size={16} style={{ color: nextCfg.color }} />
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 shrink-0">
                            <Sparkles size={13} style={{ color: rankCfg.color }} />
                            <span className="text-xs font-black" style={{ color: rankCfg.color }}>MAX</span>
                        </div>
                    )}
                </div>

                {!isMax && mmrToNext !== null && (
                    <p className="text-xs text-white/30">
                        <span className="font-bold" style={{ color: rankCfg.color }}>{mmrToNext} MMR</span>
                        {" "}needed to reach{" "}
                        <span className="font-bold text-white/60">{rankCfg.next}</span>
                    </p>
                )}
                {isMax && (
                    <p className="text-xs font-bold" style={{ color: rankCfg.color }}>
                        Elite status achieved — highest rank.
                    </p>
                )}
            </div>
        </motion.div>
    );
}

// ─── Riot Account card ─────────────────────────────────────────────────────────

const TIER_COLOR: Record<string, string> = {
    IRON:        "#6b7280",
    BRONZE:      "#cd7f32",
    SILVER:      "#c0c0c0",
    GOLD:        "#ffd700",
    PLATINUM:    "#22d3ee",
    EMERALD:     "#10b981",
    DIAMOND:     "#b9f2ff",
    MASTER:      "#9b30ff",
    GRANDMASTER: "#dc143c",
    CHALLENGER:  "#38bdf8"
};

function RiotRankedBadge({ tier, rank, lp }: { tier: string | null; rank: string | null; lp: number | null }) {
    if (!tier) {
        return <span className="text-xs text-white/30 italic">Unranked</span>;
    }
    const color = TIER_COLOR[tier] ?? "#c0c0c0";
    const showRank = !["MASTER", "GRANDMASTER", "CHALLENGER"].includes(tier);
    return (
        <span className="text-sm font-extrabold" style={{ color }}>
            {tier}{showRank ? ` ${rank}` : ""} — {lp ?? 0} LP
        </span>
    );
}

function RiotAccountCard({ user, onUpdate }: { user: User; onUpdate: () => void }) {
    const isLinked = !!user.riotPuuid;
    const [gameName, setGameName] = useState("");
    const [tagLine, setTagLine] = useState("");
    const [platform, setPlatform] = useState<RiotPlatform>("na1");
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

    async function handleLink() {
        if (!gameName.trim() || !tagLine.trim()) return;
        setLoading(true);
        setMsg(null);
        try {
            await linkRiotAccount(gameName.trim(), tagLine.trim(), platform);
            setMsg({ text: "Riot account linked successfully!", ok: true });
            setGameName("");
            setTagLine("");
            onUpdate();
        } catch (err) {
            const axiosErr = err as AxiosError<{ message?: string }>;
            setMsg({ text: axiosErr.response?.data?.message || "Failed to link account. Check name, tag and region.", ok: false });
        } finally {
            setLoading(false);
        }
    }

    async function handleUnlink() {
        setLoading(true);
        setMsg(null);
        try {
            await unlinkRiotAccount();
            setMsg({ text: "Riot account unlinked.", ok: true });
            onUpdate();
        } catch {
            setMsg({ text: "Failed to unlink account", ok: false });
        } finally {
            setLoading(false);
        }
    }

    async function handleRefresh() {
        setRefreshing(true);
        setMsg(null);
        try {
            await getMyRiotProfile();
            onUpdate();
            setMsg({ text: "Riot stats refreshed.", ok: true });
        } catch (err) {
            const axiosErr = err as AxiosError<{ message?: string }>;
            const detail = axiosErr.response?.data?.message || "Riot API unavailable. Try again later.";
            setMsg({ text: detail, ok: false });
        } finally {
            setRefreshing(false);
        }
    }

    const platformLabel = RIOT_PLATFORMS.find(p => p.value === user.riotPlatform)?.label ?? user.riotPlatform;
    const cached = user.riotCachedProfile;
    const rankedWins   = cached?.rankedWins   ?? null;
    const rankedLosses = cached?.rankedLosses ?? null;
    const rankedTotal  = (rankedWins !== null && rankedLosses !== null) ? rankedWins + rankedLosses : null;
    const rankedWinPct = (rankedTotal && rankedTotal > 0) ? Math.round((rankedWins! / rankedTotal) * 100) : null;
    const lastUpdated  = cached?.lastUpdated ? new Date(cached.lastUpdated).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : null;

    return (
        <motion.div
            className="relative rounded-2xl overflow-hidden h-full"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, #3B82F680, transparent)" }} />
            <div className="absolute inset-0 border border-white/5 backdrop-blur-xl" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)" }} />

            <div className="relative z-10 p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.2)" }}>
                            <Swords size={14} className="text-[#3B82F6]" />
                        </div>
                        <span className="text-xs font-bold tracking-[0.15em] uppercase text-white/50">Riot Account</span>
                    </div>
                    {isLinked && (
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            title="Refresh stats from Riot API"
                            className="flex items-center gap-1.5 text-xs text-white/30 hover:text-[#3B82F6] transition-colors duration-200 disabled:opacity-40"
                        >
                            <TrendingUp size={12} className={refreshing ? "animate-pulse" : ""} />
                            {refreshing ? "Refreshing..." : "Refresh"}
                        </button>
                    )}
                </div>

                <div className="flex-1">
                    <AnimatePresence mode="wait">
                        {isLinked ? (
                            <motion.div
                                key="linked"
                                initial={{ opacity: 0, scale: 0.97 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.97 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-3"
                            >
                                <div className="flex items-center gap-3 p-3 rounded-xl" style={{ border: "1px solid rgba(34,197,94,0.2)", background: "rgba(34,197,94,0.06)" }}>
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(34,197,94,0.12)" }}>
                                        <CheckCircle size={18} className="text-green-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] text-green-400 font-bold tracking-widest uppercase mb-0.5">Account Linked</p>
                                        <p className="text-base font-extrabold text-white truncate">
                                            {user.riotGameName}
                                            <span className="text-white/30 font-normal">#{user.riotTagLine}</span>
                                        </p>
                                    </div>
                                </div>

                                {cached ? (
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { label: "Solo/Duo", content: <RiotRankedBadge tier={cached.tier} rank={cached.rank} lp={cached.leaguePoints} /> },
                                            { label: "W / L", content: rankedWins !== null ? <span className="text-sm font-bold"><span className="text-green-400">{rankedWins}</span><span className="text-white/20">/</span><span className="text-red-400">{rankedLosses}</span></span> : <span className="text-xs text-white/20">—</span> },
                                            { label: "Win%", content: rankedWinPct !== null ? <span className="text-sm font-bold" style={{ color: rankedWinPct >= 50 ? "var(--status-success)" : "#ef4444" }}>{rankedWinPct}%</span> : <span className="text-xs text-white/20">—</span> }
                                        ].map(function (stat) {
                                            return (
                                                <div key={stat.label} className="p-3 rounded-xl text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                                                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1.5">{stat.label}</p>
                                                    {stat.content}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="p-3 rounded-xl text-center text-xs text-white/30" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                                        No ranked data cached yet — click Refresh
                                    </div>
                                )}

                                <div className="flex items-center justify-between text-xs text-white/30">
                                    <div className="flex items-center gap-2">
                                        <Shield size={11} />
                                        <span>{platformLabel}</span>
                                        {cached?.summonerLevel && (
                                            <span>· Lv. <span className="text-white/60 font-medium">{cached.summonerLevel}</span></span>
                                        )}
                                        {cached?.hotStreak && (
                                            <span className="flex items-center gap-1 text-orange-400 font-semibold"><Flame size={10} /> Hot streak</span>
                                        )}
                                    </div>
                                    {lastUpdated && <span>Updated {lastUpdated}</span>}
                                </div>

                                <div className="flex items-center gap-2 text-xs text-white/30">
                                    <Crosshair size={11} />
                                    <span>Compatible with <span className="text-[#3B82F6] font-medium">League of Legends</span> lobbies</span>
                                </div>

                                <button
                                    onClick={handleUnlink}
                                    disabled={loading}
                                    className="flex items-center gap-2 text-xs text-white/20 hover:text-red-400 transition-colors duration-200 disabled:opacity-50"
                                >
                                    <Unlink size={11} />
                                    {loading ? "Unlinking..." : "Unlink account"}
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="unlinked"
                                initial={{ opacity: 0, scale: 0.97 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.97 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-4"
                            >
                                <div className="flex items-start gap-2 p-3 rounded-xl" style={{ border: "1px solid rgba(245,158,11,0.2)", background: "rgba(245,158,11,0.06)" }}>
                                    <AlertCircle size={13} className="text-amber-400 mt-0.5 shrink-0" />
                                    <p className="text-xs text-amber-300/80 leading-relaxed">
                                        Link your Riot account to participate in <strong className="text-amber-300">League of Legends</strong> lobbies.
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-[10px] text-white/30 mb-1.5 font-bold tracking-widest uppercase">Game Name</label>
                                        <input
                                            type="text"
                                            placeholder="Faker"
                                            value={gameName}
                                            onChange={e => setGameName(e.target.value)}
                                            className="w-full h-10 rounded-lg px-3 text-sm outline-none transition-all"
                                            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-white/30 mb-1.5 font-bold tracking-widest uppercase">Tag</label>
                                        <input
                                            type="text"
                                            placeholder="EUW"
                                            value={tagLine}
                                            onChange={e => setTagLine(e.target.value)}
                                            className="w-full h-10 rounded-lg px-3 text-sm outline-none transition-all"
                                            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] text-white/30 mb-1.5 font-bold tracking-widest uppercase">Region</label>
                                    <select
                                        value={platform}
                                        onChange={e => setPlatform(e.target.value as RiotPlatform)}
                                        className="w-full h-10 rounded-lg px-3 text-sm outline-none transition-all"
                                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                                    >
                                        {RIOT_PLATFORMS.map(p => (
                                            <option key={p.value} value={p.value}>{p.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <button
                                    onClick={handleLink}
                                    disabled={loading || !gameName.trim() || !tagLine.trim()}
                                    className="w-full flex items-center justify-center gap-2 h-10 rounded-lg text-sm font-bold tracking-wide transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                                    style={{ background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.3)", color: "#3B82F6" }}
                                >
                                    {loading ? "Linking..." : "Link Riot Account"}
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {msg && (
                    <motion.div
                        className={"flex items-center gap-2 rounded-lg px-3 py-2 mt-3 text-xs " + (msg.ok ? "text-green-300" : "text-red-300")}
                        style={msg.ok ? { border: "1px solid rgba(34,197,94,0.2)", background: "rgba(34,197,94,0.06)" } : { border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.06)" }}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {msg.ok ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                        {msg.text}
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}

// ─── Recent Lobbies ───────────────────────────────────────────────────────────

const GAME_COLORS: Record<string, { color: string; Icon: typeof Swords }> = {
    league_of_legends: { color: "#3B82F6", Icon: Swords    },
    valorant:          { color: "#FF4655", Icon: Crosshair },
    pokemon_showdown:  { color: "#dc143c", Icon: Zap       }
};

function RecentLobbiesCard({ lobbies }: { lobbies: Lobby[] }) {
    const STATUS_COLOR: Record<string, string> = {
        open:        "text-[var(--brand-primary)]",
        pending:     "text-white/30",
        in_progress: "text-[#3B82F6]",
        completed:   "text-green-400",
        cancelled:   "text-red-400"
    };

    return (
        <motion.div
            className="relative rounded-2xl overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
        >
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(220,20,60,0.5), transparent)" }} />
            <div className="absolute inset-0 border border-white/5 backdrop-blur-xl" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)" }} />

            <div className="relative z-10 p-6">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <Trophy size={15} className="text-[var(--brand-primary)]" />
                        <span className="text-xs font-bold tracking-[0.15em] uppercase text-white/50">Recent Lobbies</span>
                    </div>
                    <NavLink to="/lobbies" className="flex items-center gap-1 text-xs text-white/30 hover:text-white transition-colors duration-200">
                        View all <ChevronRight size={13} />
                    </NavLink>
                </div>

                {lobbies.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                            <Trophy size={24} className="text-white/20" />
                        </div>
                        <p className="text-sm text-white/30 mb-3">No lobbies yet</p>
                        <NavLink to="/lobbies" className="text-xs text-[var(--brand-primary)] hover:text-white transition-colors">
                            Browse available lobbies →
                        </NavLink>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {lobbies.filter(Boolean).slice(0, 4).map(function (lobby) {
                            const gameCfg = GAME_COLORS[lobby.game] ?? GAME_COLORS.pokemon_showdown;
                            const GameIcon = gameCfg.Icon;
                            const statusKey = lobby.status as string;
                            return (
                                <div
                                    key={lobby._id}
                                    className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200 hover:border-white/10"
                                    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
                                >
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: gameCfg.color + "15", border: `1px solid ${gameCfg.color}20` }}>
                                        <GameIcon size={14} style={{ color: gameCfg.color }} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-white truncate">{lobby.name}</p>
                                        <p className="text-xs text-white/30">
                                            {new Date(lobby.matchDateTime).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                        </p>
                                    </div>
                                    <span className={"text-xs font-bold capitalize " + (STATUS_COLOR[statusKey] ?? "text-white/30")}>
                                        {lobby.status.replace("_", " ")}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </motion.div>
    );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function DashboardFooter() {
    return (
        <footer style={{ borderTop: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.3)", backdropFilter: "blur(20px)" }}>
            <div className="max-w-[1512px] mx-auto px-6 md:px-20 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-[var(--brand-primary)] flex items-center justify-center">
                                <span className="text-white font-black text-sm">G</span>
                            </div>
                            <span className="font-black text-lg">G-RANK</span>
                        </div>
                        <p className="text-sm text-white/30 max-w-xs leading-relaxed">
                            Elite esports tournament platform with MMR-based competitive ranking.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold text-xs mb-4 text-white/30 tracking-widest uppercase">Games</h4>
                        <div className="space-y-3">
                            {["Fortnite", "Rocket League", "Valorant"].map(g => (
                                <NavLink key={g} to="/lobbies" className="block text-sm text-white/30 hover:text-white transition-colors duration-300">{g}</NavLink>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="font-bold text-xs mb-4 text-white/30 tracking-widest uppercase">Tiers</h4>
                        <div className="space-y-3">
                            {["Bronze → Silver → Gold", "Platinum → Diamond", "Master → Elite"].map(t => (
                                <NavLink key={t} to="/leaderboard" className="block text-sm text-white/30 hover:text-white transition-colors duration-300">{t}</NavLink>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="pt-8 flex justify-between items-center" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    <p className="text-xs text-white/20">© 2025 G-RANK. ALL RIGHTS RESERVED.</p>
                </div>
            </div>
        </footer>
    );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
    access_denied:         "Riot login cancelled.",
    already_linked:        "This Riot account is already linked to another G-RANK account.",
    token_exchange_failed: "Failed to authenticate with Riot. Try again.",
    account_fetch_failed:  "Could not retrieve your Riot account. Try again.",
    server_error:          "Server error during Riot login. Try again.",
    missing_params:        "Riot login returned unexpected data. Try again.",
    invalid_state:         "Login session expired. Try again.",
};

export default function Dashboard() {
    const [user, setUser] = useState<User | null>(null);
    const [lobbies, setLobbies] = useState<Lobby[]>([]);
    const [oauthMsg, setOauthMsg] = useState<{ text: string; ok: boolean } | null>(null);
    const [loadError, setLoadError] = useState(false);
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const loadProfile = useCallback(async function () {
        try {
            const res = await getProfile();
            setUser(res.user);
        } catch (err: unknown) {
            const status = (err as { response?: { status?: number } }).response?.status;
            if (status === 401 || status === 403) {
                logout();
                navigate("/login");
            } else {
                setLoadError(true);
            }
        }
    }, [navigate]);

    useEffect(function () {
        loadProfile();
        getMyLobbies()
            .then(res => setLobbies(res.lobbies))
            .catch(() => setLobbies([]));
    }, [loadProfile]);

    useEffect(function () {
        const linked = searchParams.get("riot_linked");
        const error  = searchParams.get("riot_error");
        if (linked === "1") {
            setOauthMsg({ text: "Riot account linked successfully!", ok: true });
            setSearchParams({}, { replace: true });
        } else if (error) {
            const message = OAUTH_ERROR_MESSAGES[error] ?? "Riot login failed. Try again.";
            setOauthMsg({ text: message, ok: false });
            setSearchParams({}, { replace: true });
        }
    }, [searchParams, setSearchParams]);

    function handleLogout() {
        logout();
        navigate("/login");
    }

    if (!user) {
        return (
            <div className="min-h-[calc(100vh-64px)] bg-[var(--neutral-bg)] flex items-center justify-center">
                {loadError ? (
                    <div className="text-center space-y-3">
                        <p className="text-sm text-white/40">Failed to load profile</p>
                        <button
                            onClick={() => { setLoadError(false); loadProfile(); }}
                            className="text-xs text-[var(--brand-primary)] hover:underline"
                        >
                            Retry
                        </button>
                    </div>
                ) : (
                    <motion.div
                        className="flex flex-col items-center gap-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
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
                <div className="max-w-[1512px] mx-auto px-6 md:px-20 pt-12 pb-16 space-y-5">

                    {/* ── Riot OAuth result banner ── */}
                    <AnimatePresence>
                        {oauthMsg && (
                            <motion.div
                                className={"flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium " + (oauthMsg.ok ? "text-green-300" : "text-red-300")}
                                style={oauthMsg.ok ? { border: "1px solid rgba(34,197,94,0.25)", background: "rgba(34,197,94,0.08)" } : { border: "1px solid rgba(239,68,68,0.25)", background: "rgba(239,68,68,0.08)" }}
                                initial={{ opacity: 0, y: -12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -12 }}
                                transition={{ duration: 0.35 }}
                            >
                                {oauthMsg.ok ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
                                {oauthMsg.text}
                                <button onClick={() => setOauthMsg(null)} className="ml-auto text-xs opacity-40 hover:opacity-80 transition-opacity">✕</button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ── Profile hero ── */}
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
                                {/* Avatar */}
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

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <h1 className="text-3xl md:text-4xl font-black tracking-tight">{user.username}</h1>
                                        {user.role === "ADMIN" && (
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider" style={{ background: "rgba(220,20,60,0.15)", border: "1px solid rgba(220,20,60,0.3)", color: "var(--brand-primary)" }}>Admin</span>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-xs text-white/30">
                                        <span className="flex items-center gap-1.5"><Mail size={11} /> {user.email}</span>
                                        <span className="flex items-center gap-1.5"><Calendar size={11} /> Joined {new Date(user.createdAt ?? Date.now()).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
                                    </div>
                                </div>

                                {/* Rank + MMR + Logout */}
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

                    {/* ── Stat cards row ── */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard label="Wins" value={wins} icon={TrendingUp} color="var(--status-success)" bg="rgba(34,197,94,0.15)" delay={0} />
                        <StatCard label="Losses" value={losses} icon={TrendingDown} color="#ef4444" bg="rgba(239,68,68,0.15)" delay={80} />
                        <StatCard label="Win Rate" value={parseFloat(String(winRate))} icon={Percent} color="var(--status-warning)" bg="rgba(245,158,11,0.15)" suffix="%" delay={160} decimals={1} />
                        <StatCard label="Win Streak" value={winStreak} icon={winStreak >= 3 ? Flame : Zap} color={winStreak >= 3 ? "#dc143c" : "#9b30ff"} bg={winStreak >= 3 ? "rgba(220,20,60,0.15)" : "rgba(155,48,255,0.15)"} delay={240} />
                    </div>

                    {/* ── MMR Progress ── */}
                    <MmrProgressCard user={user} />

                    {/* ── Riot + Recent lobbies ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        <RecentLobbiesCard lobbies={lobbies} />
                        <RiotAccountCard user={user} onUpdate={loadProfile} />
                    </div>

                    {/* ── Quick actions ── */}
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
