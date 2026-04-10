import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { AxiosError } from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
    Trophy, TrendingUp, TrendingDown, Zap, Flame, Crown, Star, Gem, Award,
    User as UserIcon, Mail, Calendar, Shield, LogOut, Link, Unlink,
    CheckCircle, AlertCircle, Swords, Crosshair, ChevronRight, BarChart3,
    Percent, Sparkles
} from "lucide-react";
import Silk from "../components/ui/Silk";
import Button from "../components/common/Button";
import { getProfile, logout } from "../services/authService";
import { getMyLobbies } from "../services/lobbyService";
import { linkRiotAccount, unlinkRiotAccount } from "../services/riotService";
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
            className="group relative rounded-2xl border border-[var(--neutral-border)]/40 bg-[var(--neutral-surface)]/35 backdrop-blur-xl p-6 overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl"
            style={{ "--card-glow": bg } as React.CSSProperties}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 + delay / 1000, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ boxShadow: `0 20px 50px ${bg}` }}
        >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `radial-gradient(circle at 50% 0%, ${bg} 0%, transparent 70%)` }} />
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-bold tracking-widest uppercase text-[var(--neutral-text-muted)]">{label}</p>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                        style={{ backgroundColor: bg }}>
                        <Icon size={17} style={{ color }} />
                    </div>
                </div>
                <p className="text-3xl font-extrabold" style={{ color }}>
                    {display}{suffix}
                </p>
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
            className="rounded-2xl border border-[var(--neutral-border)]/40 bg-[var(--neutral-surface)]/35 backdrop-blur-xl p-6 hover:-translate-y-0.5 transition-all duration-500 hover:shadow-2xl"
            initial={{ opacity: 0, y: 30, scaleY: 0.96 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            style={{ originY: 0 }}
            transition={{ duration: 0.8, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ boxShadow: `0 20px 50px ${rankCfg.glow}` }}
        >
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                    <BarChart3 size={16} className="text-[var(--brand-primary)]" />
                    <span className="text-sm font-bold tracking-wide text-[var(--neutral-text-secondary)] uppercase">Rank Progress</span>
                </div>
                <span className="text-xs text-[var(--neutral-text-muted)]">{user.mmr.toLocaleString()} MMR</span>
            </div>

            <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: rankCfg.color + "20" }}>
                        <RankIcon size={16} style={{ color: rankCfg.color }} />
                    </div>
                    <span className="text-sm font-bold" style={{ color: rankCfg.color }}>{user.rank}</span>
                </div>
                <div className="flex-1 relative h-2.5 bg-[var(--neutral-bg)] rounded-full overflow-hidden">
                    <motion.div
                        className="h-full rounded-full relative"
                        style={{ background: `linear-gradient(90deg, ${rankCfg.color}aa, ${rankCfg.color})` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1.2, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full border-2 shadow-sm"
                            style={{ borderColor: rankCfg.color }} />
                    </motion.div>
                </div>
                {nextCfg && NextIcon ? (
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-[var(--neutral-text-muted)]">{rankCfg.next}</span>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center opacity-50"
                            style={{ backgroundColor: nextCfg.color + "20" }}>
                            <NextIcon size={16} style={{ color: nextCfg.color }} />
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-1.5">
                        <Sparkles size={13} style={{ color: rankCfg.color }} />
                        <span className="text-xs font-bold" style={{ color: rankCfg.color }}>MAX</span>
                    </div>
                )}
            </div>

            {!isMax && mmrToNext !== null && (
                <p className="text-xs text-[var(--neutral-text-muted)]">
                    <span className="font-semibold" style={{ color: rankCfg.color }}>{mmrToNext} MMR</span>
                    {" "}needed to reach{" "}
                    <span className="font-semibold text-white">{rankCfg.next}</span>
                </p>
            )}
            {isMax && (
                <p className="text-xs font-semibold" style={{ color: rankCfg.color }}>
                    You are at the highest rank — Elite status achieved.
                </p>
            )}
        </motion.div>
    );
}

// ─── Riot Account card ─────────────────────────────────────────────────────────

function RiotAccountCard({ user, onUpdate }: { user: User; onUpdate: () => void }) {
    const isLinked = !!user.riotPuuid;
    const [gameName, setGameName] = useState("");
    const [tagLine, setTagLine] = useState("");
    const [platform, setPlatform] = useState<RiotPlatform>("na1");
    const [loading, setLoading] = useState(false);
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
            setMsg({ text: axiosErr.response?.data?.message || "Failed to link account", ok: false });
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

    const platformLabel = RIOT_PLATFORMS.find(p => p.value === user.riotPlatform)?.label ?? user.riotPlatform;

    return (
        <motion.div
            className="rounded-2xl border border-[var(--neutral-border)]/40 bg-[var(--neutral-surface)]/35 backdrop-blur-xl p-6 h-full"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
            <div className="flex items-center gap-2 mb-5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#3B82F6]/15">
                    <Swords size={14} className="text-[#3B82F6]" />
                </div>
                <span className="text-sm font-bold tracking-wide text-[var(--neutral-text-secondary)] uppercase">Riot Account</span>
            </div>

            <AnimatePresence mode="wait">
                {isLinked ? (
                    <motion.div
                        key="linked"
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.97 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                    >
                        <div className="flex items-center gap-3 p-4 rounded-xl border border-green-500/25 bg-green-500/6">
                            <div className="w-10 h-10 rounded-xl bg-green-500/15 flex items-center justify-center">
                                <CheckCircle size={20} className="text-green-400" />
                            </div>
                            <div>
                                <p className="text-xs text-green-400 font-semibold mb-0.5">Account Linked</p>
                                <p className="text-base font-extrabold text-white">
                                    {user.riotGameName}
                                    <span className="text-[var(--neutral-text-muted)] font-normal">#{user.riotTagLine}</span>
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-[var(--neutral-text-muted)]">
                            <Shield size={12} />
                            <span>Region: <span className="text-white font-medium">{platformLabel}</span></span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-[var(--neutral-text-muted)]">
                            <Crosshair size={12} />
                            <span>Compatible with <span className="text-[#3B82F6] font-medium">League of Legends</span> & <span className="text-[#FF4655] font-medium">Valorant</span> lobbies</span>
                        </div>

                        <button
                            onClick={handleUnlink}
                            disabled={loading}
                            className="flex items-center gap-2 text-xs text-[var(--neutral-text-muted)] hover:text-red-400 transition-colors duration-200 mt-2 disabled:opacity-50"
                        >
                            <Unlink size={12} />
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
                        className="space-y-3"
                    >
                        <div className="flex items-start gap-2 p-3 rounded-xl border border-amber-500/25 bg-amber-500/6 mb-4">
                            <AlertCircle size={13} className="text-amber-400 mt-0.5 shrink-0" />
                            <p className="text-xs text-amber-300 leading-relaxed">
                                Link your Riot account to participate in <strong>LoL</strong> and <strong>Valorant</strong> lobbies and submit match results.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-xs text-[var(--neutral-text-muted)] mb-1.5 font-medium">Game Name</label>
                                <input
                                    type="text"
                                    placeholder="Faker"
                                    value={gameName}
                                    onChange={e => setGameName(e.target.value)}
                                    className="w-full h-10 rounded-lg bg-[var(--neutral-bg)]/60 border border-[var(--neutral-border)]/50 px-3 text-sm outline-none focus:border-[#3B82F6]/50 focus:ring-1 focus:ring-[#3B82F6]/20 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-[var(--neutral-text-muted)] mb-1.5 font-medium">Tag Line</label>
                                <input
                                    type="text"
                                    placeholder="KR1"
                                    value={tagLine}
                                    onChange={e => setTagLine(e.target.value)}
                                    className="w-full h-10 rounded-lg bg-[var(--neutral-bg)]/60 border border-[var(--neutral-border)]/50 px-3 text-sm outline-none focus:border-[#3B82F6]/50 focus:ring-1 focus:ring-[#3B82F6]/20 transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs text-[var(--neutral-text-muted)] mb-1.5 font-medium">Region</label>
                            <select
                                value={platform}
                                onChange={e => setPlatform(e.target.value as RiotPlatform)}
                                className="w-full h-10 rounded-lg bg-[var(--neutral-bg)]/60 border border-[var(--neutral-border)]/50 px-3 text-sm outline-none focus:border-[#3B82F6]/50 transition-all"
                            >
                                {RIOT_PLATFORMS.map(p => (
                                    <option key={p.value} value={p.value}>{p.label}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={handleLink}
                            disabled={loading || !gameName.trim() || !tagLine.trim()}
                            className="w-full flex items-center justify-center gap-2 h-10 rounded-lg text-sm font-semibold bg-[#3B82F6]/15 border border-[#3B82F6]/40 text-[#3B82F6] hover:bg-[#3B82F6]/25 hover:border-[#3B82F6]/60 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <Link size={14} />
                            {loading ? "Linking..." : "Link Riot Account"}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {msg && (
                <motion.div
                    className={"flex items-center gap-2 rounded-lg px-3 py-2 mt-3 text-xs " + (msg.ok ? "border border-green-500/25 bg-green-500/8 text-green-300" : "border border-red-500/25 bg-red-500/8 text-red-300")}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {msg.ok ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                    {msg.text}
                </motion.div>
            )}
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
        pending:     "text-[var(--neutral-text-muted)]",
        in_progress: "text-[#3B82F6]",
        completed:   "text-green-400",
        cancelled:   "text-red-400"
    };

    return (
        <motion.div
            className="rounded-2xl border border-[var(--neutral-border)]/40 bg-[var(--neutral-surface)]/35 backdrop-blur-xl p-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
        >
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                    <Trophy size={15} className="text-[var(--brand-primary)]" />
                    <span className="text-sm font-bold tracking-wide text-[var(--neutral-text-secondary)] uppercase">Recent Lobbies</span>
                </div>
                <NavLink to="/lobbies" className="flex items-center gap-1 text-xs text-[var(--neutral-text-muted)] hover:text-white transition-colors duration-200">
                    View all <ChevronRight size={13} />
                </NavLink>
            </div>

            {lobbies.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-[var(--neutral-border)]/20 flex items-center justify-center mb-3">
                        <Trophy size={22} className="text-[var(--neutral-text-muted)]" />
                    </div>
                    <p className="text-sm text-[var(--neutral-text-muted)]">No lobbies yet</p>
                    <NavLink to="/lobbies" className="mt-3 text-xs text-[var(--brand-primary)] hover:text-white transition-colors underline underline-offset-2">
                        Browse available lobbies →
                    </NavLink>
                </div>
            ) : (
                <div className="space-y-2">
                    {lobbies.slice(0, 4).map(function (lobby) {
                        const gameCfg = GAME_COLORS[lobby.game] ?? GAME_COLORS.pokemon_showdown;
                        const GameIcon = gameCfg.Icon;
                        const statusKey = lobby.status as string;
                        return (
                            <div key={lobby._id} className="flex items-center gap-3 p-3 rounded-xl border border-[var(--neutral-border)]/30 bg-[var(--neutral-bg)]/30 hover:border-[var(--neutral-border)]/60 transition-colors duration-200">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                    style={{ backgroundColor: gameCfg.color + "18" }}>
                                    <GameIcon size={14} style={{ color: gameCfg.color }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-white truncate">{lobby.name}</p>
                                    <p className="text-xs text-[var(--neutral-text-muted)]">
                                        {new Date(lobby.matchDateTime).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                    </p>
                                </div>
                                <span className={"text-xs font-bold capitalize " + (STATUS_COLOR[statusKey] ?? "text-[var(--neutral-text-muted)]")}>
                                    {lobby.status.replace("_", " ")}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function DashboardFooter() {
    return (
        <footer className="border-t border-[var(--neutral-border)]/40 bg-[var(--neutral-surface)]/40 backdrop-blur-xl">
            <div className="max-w-[1512px] mx-auto px-6 md:px-20 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-4 group cursor-pointer">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-primary)]/70 flex items-center justify-center shadow-lg shadow-[var(--brand-primary)]/30 transition-all duration-500 group-hover:scale-110">
                                <span className="text-white font-extrabold text-sm">G</span>
                            </div>
                            <span className="font-extrabold text-lg transition-colors duration-300 group-hover:text-[var(--brand-primary)]">G-RANK</span>
                        </div>
                        <p className="text-sm text-[var(--neutral-text-secondary)] max-w-xs leading-relaxed">
                            Elite esports tournament platform with MMR-based competitive ranking.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold text-sm mb-4 text-[var(--neutral-text)] tracking-wide">GAMES</h4>
                        <div className="space-y-3">
                            <NavLink to="/lobbies" className="block text-sm text-[var(--neutral-text-secondary)] hover:text-white hover:translate-x-1 transition-all duration-300">Fortnite</NavLink>
                            <NavLink to="/lobbies" className="block text-sm text-[var(--neutral-text-secondary)] hover:text-white hover:translate-x-1 transition-all duration-300">Rocket League</NavLink>
                            <NavLink to="/lobbies" className="block text-sm text-[var(--neutral-text-secondary)] hover:text-white hover:translate-x-1 transition-all duration-300">Valorant</NavLink>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-bold text-sm mb-4 text-[var(--neutral-text)] tracking-wide">TIERS</h4>
                        <div className="space-y-3">
                            <NavLink to="/leaderboard" className="block text-sm text-[var(--neutral-text-secondary)] hover:text-white hover:translate-x-1 transition-all duration-300">Bronze → Silver → Gold</NavLink>
                            <NavLink to="/leaderboard" className="block text-sm text-[var(--neutral-text-secondary)] hover:text-white hover:translate-x-1 transition-all duration-300">Platinum → Diamond</NavLink>
                            <NavLink to="/leaderboard" className="block text-sm text-[var(--neutral-text-secondary)] hover:text-white hover:translate-x-1 transition-all duration-300">Master → Elite</NavLink>
                        </div>
                    </div>
                </div>
                <div className="pt-8 border-t border-[var(--neutral-border)]/30 flex justify-between items-center">
                    <p className="text-xs text-[var(--neutral-text-muted)]">© 2025 G-RANK. ALL RIGHTS RESERVED.</p>
                </div>
            </div>
        </footer>
    );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────

export default function Dashboard() {
    const [user, setUser] = useState<User | null>(null);
    const [lobbies, setLobbies] = useState<Lobby[]>([]);
    const navigate = useNavigate();

    const loadProfile = useCallback(async function () {
        try {
            const res = await getProfile();
            setUser(res.user);
        } catch (err) {
            const axiosErr = err as AxiosError;
            if (axiosErr.response?.status === 401 || axiosErr.response?.status === 403) {
                logout();
                navigate("/login");
            }
        }
    }, [navigate]);

    useEffect(function () {
        loadProfile();
        getMyLobbies()
            .then(res => setLobbies(res.lobbies))
            .catch(() => setLobbies([]));
    }, [loadProfile]);

    function handleLogout() {
        logout();
        navigate("/login");
    }

    if (!user) {
        return (
            <div className="min-h-[calc(100vh-64px)] bg-[var(--neutral-bg)] flex items-center justify-center">
                <motion.div
                    className="flex flex-col items-center gap-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <div className="w-10 h-10 rounded-full border-2 border-[var(--brand-primary)]/40 border-t-[var(--brand-primary)] animate-spin" />
                    <p className="text-sm text-[var(--neutral-text-muted)]">Loading profile...</p>
                </motion.div>
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
                <div className="max-w-[1512px] mx-auto px-6 md:px-20 pt-12 pb-16 space-y-6">

                    {/* ── Profile hero ── */}
                    <motion.div
                        className="relative rounded-2xl border border-[var(--neutral-border)]/40 bg-[var(--neutral-surface)]/35 backdrop-blur-xl p-8 overflow-hidden"
                        initial={{ opacity: 0, y: 28, scaleY: 0.97 }}
                        animate={{ opacity: 1, y: 0, scaleY: 1 }}
                        style={{ originY: 0 }}
                        transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                    >
                        {/* Glow accent behind rank icon */}
                        <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-[120px] pointer-events-none opacity-20"
                            style={{ background: rankCfg.color, transform: "translate(30%, -30%)" }} />

                        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-8">
                            {/* Avatar */}
                            <div className="relative shrink-0">
                                <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-extrabold"
                                    style={{
                                        background: `linear-gradient(135deg, ${rankCfg.color}30, ${rankCfg.color}10)`,
                                        border: `2px solid ${rankCfg.color}50`,
                                        boxShadow: `0 0 30px ${rankCfg.glow}`
                                    }}>
                                    {initial}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg flex items-center justify-center"
                                    style={{ backgroundColor: rankCfg.color, boxShadow: `0 0 12px ${rankCfg.glow}` }}>
                                    <RankIcon size={13} className="text-white" />
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <h1 className="text-3xl md:text-4xl font-extrabold">{user.username}</h1>
                                    {user.role === "ADMIN" && (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--brand-primary)]/20 border border-[var(--brand-primary)]/40 text-[var(--brand-primary)] uppercase tracking-wider">Admin</span>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-4 text-xs text-[var(--neutral-text-muted)]">
                                    <span className="flex items-center gap-1.5"><Mail size={11} /> {user.email}</span>
                                    <span className="flex items-center gap-1.5"><Calendar size={11} /> Joined {new Date(user.createdAt ?? Date.now()).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
                                </div>
                            </div>

                            {/* Rank + MMR */}
                            <div className="flex items-center gap-6 shrink-0">
                                <div className="text-center">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                                            style={{ backgroundColor: rankCfg.color + "20" }}>
                                            <RankIcon size={16} style={{ color: rankCfg.color }} />
                                        </div>
                                        <span className="text-xl font-extrabold" style={{ color: rankCfg.color }}>{user.rank}</span>
                                    </div>
                                    <p className="text-xs text-[var(--neutral-text-muted)]">Current Rank</p>
                                </div>
                                <div className="w-px h-10 bg-[var(--neutral-border)]/40" />
                                <div className="text-center">
                                    <p className="text-3xl font-extrabold text-[var(--brand-primary)] tabular-nums">{user.mmr.toLocaleString()}</p>
                                    <p className="text-xs text-[var(--neutral-text-muted)]">MMR</p>
                                </div>
                                <div className="w-px h-10 bg-[var(--neutral-border)]/40" />
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--neutral-border)]/40 text-xs font-semibold text-[var(--neutral-text-muted)] hover:border-red-500/40 hover:text-red-400 hover:bg-red-500/6 transition-all duration-200"
                                >
                                    <LogOut size={13} />
                                    Sign out
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* ── Stat cards row ── */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            label="Wins"
                            value={wins}
                            icon={TrendingUp}
                            color="var(--status-success)"
                            bg="rgba(34,197,94,0.15)"
                            delay={0}
                        />
                        <StatCard
                            label="Losses"
                            value={losses}
                            icon={TrendingDown}
                            color="#ef4444"
                            bg="rgba(239,68,68,0.15)"
                            delay={80}
                        />
                        <StatCard
                            label="Win Rate"
                            value={parseFloat(String(winRate))}
                            icon={Percent}
                            color="var(--status-warning)"
                            bg="rgba(245,158,11,0.15)"
                            suffix="%"
                            delay={160}
                            decimals={1}
                        />
                        <StatCard
                            label="Win Streak"
                            value={winStreak}
                            icon={winStreak >= 3 ? Flame : Zap}
                            color={winStreak >= 3 ? "#dc143c" : "#9b30ff"}
                            bg={winStreak >= 3 ? "rgba(220,20,60,0.15)" : "rgba(155,48,255,0.15)"}
                            delay={240}
                        />
                    </div>

                    {/* ── MMR Progress (full width) ── */}
                    <MmrProgressCard user={user} />

                    {/* ── Riot + Recent lobbies ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
