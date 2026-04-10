import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AxiosError } from "axios";
import {
    Award, Crown, Flame, Gem, Star, Trophy, Zap,
    LogOut, Link2, Unlink2, ChevronRight, Calendar,
    Users, Gamepad2, CheckCircle2, AlertCircle,
    TrendingUp, Shield, RefreshCw, type LucideIcon
} from "lucide-react";
import LineWaves from "../components/ui/LineWaves";
import { getProfile, logout } from "../services/authService";
import { getMyLobbies } from "../services/lobbyService";
import { linkRiotAccount, unlinkRiotAccount } from "../services/riotService";
import type { User, Lobby, RiotPlatform } from "../types";

// ─── Rank configuration ────────────────────────────────────────────────────────

type RankName = "Bronze" | "Silver" | "Gold" | "Platinum" | "Diamond" | "Master" | "Elite";

const RANK_CONFIG: Record<RankName, {
    color: string;
    glow: string;
    Icon: LucideIcon;
    min: number;
    max: number;
    next: RankName | null;
    nextMin: number | null;
}> = {
    Bronze:   { color: "#cd7f32", glow: "rgba(205,127,50,0.4)",  Icon: Shield,  min: 0,    max: 499,      next: "Silver",   nextMin: 500  },
    Silver:   { color: "#c0c0c0", glow: "rgba(192,192,192,0.4)", Icon: Award,   min: 500,  max: 999,      next: "Gold",     nextMin: 1000 },
    Gold:     { color: "#ffd700", glow: "rgba(255,215,0,0.45)",  Icon: Trophy,  min: 1000, max: 1499,     next: "Platinum", nextMin: 1500 },
    Platinum: { color: "#00e5ff", glow: "rgba(0,229,255,0.35)",  Icon: Gem,     min: 1500, max: 1999,     next: "Diamond",  nextMin: 2000 },
    Diamond:  { color: "#b9f2ff", glow: "rgba(185,242,255,0.4)", Icon: Star,    min: 2000, max: 2499,     next: "Master",   nextMin: 2500 },
    Master:   { color: "#bf00ff", glow: "rgba(191,0,255,0.35)",  Icon: Crown,   min: 2500, max: 2999,     next: "Elite",    nextMin: 3000 },
    Elite:    { color: "#dc143c", glow: "rgba(220,20,60,0.45)",  Icon: Flame,   min: 3000, max: Infinity, next: null,       nextMin: null },
};

function getRankConfig(rank: string) {
    return RANK_CONFIG[rank as RankName] ?? RANK_CONFIG.Bronze;
}

// ─── useCountUp ────────────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 1000, delay = 0): number {
    const [value, setValue] = useState(0);
    const raf = useRef<number>(0);
    const startTime = useRef<number | null>(null);

    useEffect(() => {
        let timeout: ReturnType<typeof setTimeout>;

        function step(ts: number) {
            if (!startTime.current) startTime.current = ts;
            const elapsed = ts - startTime.current;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(eased * target));
            if (progress < 1) raf.current = requestAnimationFrame(step);
        }

        timeout = setTimeout(() => {
            raf.current = requestAnimationFrame(step);
        }, delay);

        return () => {
            clearTimeout(timeout);
            cancelAnimationFrame(raf.current);
            startTime.current = null;
        };
    }, [target, duration, delay]);

    return value;
}

// ─── Background ────────────────────────────────────────────────────────────────

function DashboardBackground() {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none">
            <div className="absolute inset-0 bg-[var(--neutral-bg)]" />
            <div className="absolute inset-0 opacity-60">
                <LineWaves
                    color1="#dc143c"
                    color2="#7b0020"
                    color3="#ff2244"
                    brightness={0.14}
                    speed={0.22}
                    warpIntensity={0.75}
                    innerLineCount={26}
                    outerLineCount={32}
                    rotation={-28}
                    colorCycleSpeed={0.6}
                    enableMouseInteraction={false}
                />
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--neutral-bg)]/40 via-transparent to-[var(--neutral-bg)]/80" />
        </div>
    );
}

// ─── StatCard ──────────────────────────────────────────────────────────────────

interface StatCardProps {
    label: string;
    value: number;
    decimals?: number;
    suffix?: string;
    color: string;
    Icon: LucideIcon;
    delay?: number;
    index?: number;
}

function StatCard({ label, value, decimals = 0, suffix = "", color, Icon, delay = 0, index = 0 }: StatCardProps) {
    const displayed = useCountUp(decimals > 0 ? Math.round(value) : value, 1000, delay);
    const displayValue = decimals > 0
        ? (value).toFixed(decimals)
        : displayed.toString();

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.15 + index * 0.07 }}
            className="relative rounded-2xl p-5 overflow-hidden
                       bg-[var(--neutral-surface)]/30 backdrop-blur-xl
                       border border-[var(--neutral-border)]/35
                       hover:border-[var(--neutral-border)]/60 transition-colors duration-300"
        >
            <div
                className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-20"
                style={{ background: color }}
            />
            <div className="flex items-start justify-between mb-3">
                <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: `${color}22`, border: `1px solid ${color}44` }}
                >
                    <Icon size={17} style={{ color }} />
                </div>
            </div>
            <p className="text-2xl font-bold text-white leading-none">
                {displayValue}{suffix}
            </p>
            <p className="text-sm text-[var(--neutral-muted)] mt-1">{label}</p>
        </motion.div>
    );
}

// ─── MmrProgressCard ──────────────────────────────────────────────────────────

function MmrProgressCard({ user }: { user: User }) {
    const cfg = getRankConfig(user.rank);
    const mmrCount = useCountUp(user.mmr, 1200, 300);
    const isMax = cfg.next === null;
    const progress = isMax
        ? 100
        : Math.min(100, ((user.mmr - cfg.min) / (cfg.max - cfg.min + 1)) * 100);

    const NextIcon = cfg.next ? getRankConfig(cfg.next).Icon : null;
    const nextColor = cfg.next ? getRankConfig(cfg.next).color : cfg.color;

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1], delay: 0.45 }}
            className="rounded-2xl p-6
                       bg-[var(--neutral-surface)]/30 backdrop-blur-xl
                       border border-[var(--neutral-border)]/35"
        >
            <div className="flex items-center justify-between mb-5">
                <div>
                    <p className="text-xs text-[var(--neutral-muted)] uppercase tracking-widest mb-1">MMR Rating</p>
                    <p className="text-3xl font-extrabold text-white">
                        {mmrCount} <span className="text-lg font-semibold" style={{ color: cfg.color }}>MMR</span>
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-center">
                        <div
                            className="w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-1"
                            style={{ background: `${cfg.color}20`, border: `1px solid ${cfg.color}50`, boxShadow: `0 0 16px ${cfg.glow}` }}
                        >
                            <cfg.Icon size={22} style={{ color: cfg.color }} />
                        </div>
                        <p className="text-xs text-[var(--neutral-muted)]">{user.rank}</p>
                    </div>
                    {cfg.next && NextIcon && (
                        <>
                            <ChevronRight size={16} className="text-[var(--neutral-muted)]" />
                            <div className="text-center">
                                <div
                                    className="w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-1 opacity-60"
                                    style={{ background: `${nextColor}15`, border: `1px solid ${nextColor}35` }}
                                >
                                    <NextIcon size={22} style={{ color: nextColor }} />
                                </div>
                                <p className="text-xs text-[var(--neutral-muted)]">{cfg.next}</p>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="h-2 rounded-full bg-white/10 overflow-hidden mb-2">
                <motion.div
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${cfg.color}99, ${cfg.color})` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
                />
            </div>
            <div className="flex justify-between text-xs text-[var(--neutral-muted)]">
                <span>{cfg.min} MMR</span>
                {isMax
                    ? <span className="font-semibold" style={{ color: cfg.color }}>Max rank achieved</span>
                    : <span>{cfg.nextMin! - user.mmr} MMR to {cfg.next}</span>
                }
                <span>{isMax ? "∞" : `${cfg.max} MMR`}</span>
            </div>
        </motion.div>
    );
}

// ─── RiotAccountCard ──────────────────────────────────────────────────────────

const RIOT_PLATFORMS: { value: RiotPlatform; label: string }[] = [
    { value: "na1",  label: "NA" },
    { value: "euw1", label: "EUW" },
    { value: "eun1", label: "EUNE" },
    { value: "kr",   label: "KR" },
    { value: "br1",  label: "BR" },
    { value: "la1",  label: "LAN" },
    { value: "la2",  label: "LAS" },
    { value: "jp1",  label: "JP" },
    { value: "oc1",  label: "OCE" },
    { value: "tr1",  label: "TR" },
    { value: "ru",   label: "RU" },
];

function RiotAccountCard({ user, onUpdate }: { user: User; onUpdate: () => void }) {
    const isLinked = Boolean(user.riotPuuid);
    const [gameName, setGameName] = useState("");
    const [tagLine, setTagLine] = useState("");
    const [platform, setPlatform] = useState<RiotPlatform>("na1");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleLink() {
        if (!gameName.trim() || !tagLine.trim()) return;
        setLoading(true);
        setError(null);
        try {
            await linkRiotAccount(gameName.trim(), tagLine.trim(), platform);
            setGameName("");
            setTagLine("");
            onUpdate();
        } catch (err) {
            const ax = err as AxiosError<{ message?: string }>;
            setError(ax.response?.data?.message ?? "Failed to link account");
        } finally {
            setLoading(false);
        }
    }

    async function handleUnlink() {
        setLoading(true);
        setError(null);
        try {
            await unlinkRiotAccount();
            onUpdate();
        } catch (err) {
            const ax = err as AxiosError<{ message?: string }>;
            setError(ax.response?.data?.message ?? "Failed to unlink account");
        } finally {
            setLoading(false);
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
            className="rounded-2xl p-6
                       bg-[var(--neutral-surface)]/30 backdrop-blur-xl
                       border border-[var(--neutral-border)]/35"
        >
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#c89b3c]/15 border border-[#c89b3c]/30 flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#c89b3c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <h3 className="font-semibold text-white text-sm">Riot Games Account</h3>
            </div>

            <AnimatePresence mode="wait">
                {isLinked ? (
                    <motion.div
                        key="linked"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 mb-4">
                            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-white truncate">
                                    {user.riotGameName}#{user.riotTagLine}
                                </p>
                                <p className="text-xs text-[var(--neutral-muted)] uppercase">
                                    {user.riotPlatform} · Account linked
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleUnlink}
                            disabled={loading}
                            className="flex items-center gap-2 text-xs text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                        >
                            <Unlink2 size={13} />
                            {loading ? "Unlinking…" : "Unlink account"}
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="unlinked"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 mb-4">
                            <AlertCircle size={14} className="text-amber-400 mt-0.5 shrink-0" />
                            <p className="text-xs text-amber-300 leading-relaxed">
                                Link your Riot account to participate in LoL and Valorant tournaments.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-2">
                            <input
                                value={gameName}
                                onChange={e => setGameName(e.target.value)}
                                placeholder="Game Name"
                                className="col-span-1 px-3 py-2 text-sm rounded-xl
                                           bg-white/5 border border-[var(--neutral-border)]/40
                                           text-white placeholder-[var(--neutral-muted)]
                                           focus:outline-none focus:border-[var(--brand-primary)]/60
                                           transition-colors"
                            />
                            <input
                                value={tagLine}
                                onChange={e => setTagLine(e.target.value)}
                                placeholder="Tag (e.g. NA1)"
                                className="col-span-1 px-3 py-2 text-sm rounded-xl
                                           bg-white/5 border border-[var(--neutral-border)]/40
                                           text-white placeholder-[var(--neutral-muted)]
                                           focus:outline-none focus:border-[var(--brand-primary)]/60
                                           transition-colors"
                            />
                        </div>

                        <select
                            value={platform}
                            onChange={e => setPlatform(e.target.value as RiotPlatform)}
                            className="w-full px-3 py-2 text-sm rounded-xl mb-3
                                       bg-white/5 border border-[var(--neutral-border)]/40
                                       text-white focus:outline-none focus:border-[var(--brand-primary)]/60
                                       transition-colors"
                        >
                            {RIOT_PLATFORMS.map(p => (
                                <option key={p.value} value={p.value} className="bg-[#1a0a10]">
                                    {p.label}
                                </option>
                            ))}
                        </select>

                        <button
                            onClick={handleLink}
                            disabled={loading || !gameName.trim() || !tagLine.trim()}
                            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold
                                       bg-[#c89b3c]/15 hover:bg-[#c89b3c]/25 border border-[#c89b3c]/30
                                       text-[#e8b84b] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <Link2 size={14} />
                            {loading ? "Linking…" : "Link Riot Account"}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {error && (
                <p className="text-xs text-red-400 mt-2">{error}</p>
            )}
        </motion.div>
    );
}

// ─── RecentLobbiesCard ────────────────────────────────────────────────────────

const GAME_LABELS: Record<string, { label: string; color: string }> = {
    pokemon_showdown: { label: "Pokémon", color: "#ffcc00" },
    league_of_legends: { label: "LoL",     color: "#c89b3c" },
    valorant:          { label: "VAL",     color: "#ff4655" },
};

const STATUS_STYLES: Record<string, { dot: string; text: string; label: string }> = {
    open:        { dot: "bg-emerald-400", text: "text-emerald-400", label: "Open" },
    pending:     { dot: "bg-amber-400",   text: "text-amber-400",   label: "Pending" },
    in_progress: { dot: "bg-blue-400",    text: "text-blue-400",    label: "In Progress" },
    completed:   { dot: "bg-[var(--neutral-muted)]", text: "text-[var(--neutral-muted)]", label: "Completed" },
    cancelled:   { dot: "bg-red-500",     text: "text-red-400",     label: "Cancelled" },
};

function RecentLobbiesCard() {
    const [lobbies, setLobbies] = useState<Lobby[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        getMyLobbies()
            .then(r => setLobbies(r.lobbies.slice(0, 4)))
            .catch(() => setLobbies([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1], delay: 0.55 }}
            className="rounded-2xl p-6
                       bg-[var(--neutral-surface)]/30 backdrop-blur-xl
                       border border-[var(--neutral-border)]/35"
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                    <Gamepad2 size={15} className="text-[var(--neutral-muted)]" />
                    My Tournaments
                </h3>
                <button
                    onClick={() => navigate("/lobbies")}
                    className="text-xs text-[var(--neutral-muted)] hover:text-white flex items-center gap-1 transition-colors"
                >
                    See all <ChevronRight size={12} />
                </button>
            </div>

            {loading ? (
                <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-14 rounded-xl bg-white/5 animate-pulse" />
                    ))}
                </div>
            ) : lobbies.length === 0 ? (
                <div className="text-center py-6">
                    <Users size={28} className="text-[var(--neutral-muted)]/40 mx-auto mb-2" />
                    <p className="text-sm text-[var(--neutral-muted)]">No tournaments joined yet</p>
                    <button
                        onClick={() => navigate("/lobbies")}
                        className="mt-3 text-xs text-[var(--brand-primary)] hover:underline"
                    >
                        Browse tournaments →
                    </button>
                </div>
            ) : (
                <div className="space-y-2">
                    {lobbies.map((lobby, i) => {
                        const game = GAME_LABELS[lobby.game] ?? { label: "Game", color: "#888" };
                        const status = STATUS_STYLES[lobby.status] ?? STATUS_STYLES.open;
                        const date = new Date(lobby.matchDateTime).toLocaleDateString("en-US", { month: "short", day: "numeric" });
                        return (
                            <motion.div
                                key={lobby._id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6 + i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                className="flex items-center justify-between px-3 py-2.5 rounded-xl
                                           bg-white/5 hover:bg-white/8 border border-white/5
                                           transition-colors cursor-pointer group"
                                onClick={() => navigate("/lobbies")}
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <span
                                        className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                                        style={{ color: game.color, background: `${game.color}18`, border: `1px solid ${game.color}30` }}
                                    >
                                        {game.label}
                                    </span>
                                    <span className="text-sm text-white truncate">{lobby.name}</span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-xs text-[var(--neutral-muted)] flex items-center gap-1">
                                        <Calendar size={10} />
                                        {date}
                                    </span>
                                    <span className={`flex items-center gap-1 text-xs ${status.text}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                                        {status.label}
                                    </span>
                                </div>
                            </motion.div>
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
        <footer className="mt-16 border-t border-[var(--neutral-border)]/30">
            <div className="max-w-[1512px] mx-auto px-6 md:px-20 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-xs text-[var(--neutral-muted)]">
                    © 2025 G-RANK. All rights reserved.
                </p>
                <div className="flex items-center gap-6">
                    {["Terms", "Privacy", "Support"].map(item => (
                        <a key={item} href="#" className="text-xs text-[var(--neutral-muted)] hover:text-white transition-colors">
                            {item}
                        </a>
                    ))}
                </div>
            </div>
        </footer>
    );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function Dashboard() {
    const [user, setUser] = useState<User | null>(null);
    const [loadError, setLoadError] = useState(false);
    const navigate = useNavigate();

    const loadProfile = useCallback(async () => {
        try {
            const response = await getProfile();
            setUser(response.user);
        } catch (err) {
            const ax = err as AxiosError;
            if (ax.response?.status === 401 || ax.response?.status === 403) {
                logout();
                navigate("/login");
            } else {
                setLoadError(true);
            }
        }
    }, [navigate]);

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    function handleLogout() {
        logout();
        navigate("/login");
    }

    if (!user) {
        return (
            <div className="min-h-[calc(100vh-64px)] bg-[var(--neutral-bg)] flex items-center justify-center">
                {loadError ? (
                    <div className="text-center">
                        <p className="text-[var(--neutral-muted)] mb-4">Failed to load profile</p>
                        <button
                            onClick={() => { setLoadError(false); loadProfile(); }}
                            className="flex items-center gap-2 text-sm text-white px-4 py-2 rounded-xl
                                       bg-[var(--neutral-surface)]/40 border border-[var(--neutral-border)]/40 hover:bg-[var(--neutral-surface)]/60"
                        >
                            <RefreshCw size={14} /> Retry
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 rounded-full border-2 border-[var(--brand-primary)] border-t-transparent animate-spin" />
                        <p className="text-sm text-[var(--neutral-muted)]">Loading…</p>
                    </div>
                )}
            </div>
        );
    }

    const cfg = getRankConfig(user.rank);
    const initial = user.username.charAt(0).toUpperCase();
    const joinDate = new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" });
    const wins = user.wins ?? 0;
    const losses = user.losses ?? 0;
    const winRate = user.winRate ?? 0;
    const winStreak = user.winStreak ?? 0;
    const streakIsHot = winStreak >= 3;

    return (
        <div className="relative text-white min-h-[calc(100vh-64px)]">
            <DashboardBackground />

            <div className="relative z-10 max-w-[1512px] mx-auto px-6 md:px-20 pt-10 pb-4">

                {/* ── Hero profile card ── */}
                <motion.div
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                    className="relative rounded-2xl overflow-hidden mb-8
                               bg-[var(--neutral-surface)]/30 backdrop-blur-xl
                               border border-[var(--neutral-border)]/35"
                >
                    {/* rank glow band */}
                    <div
                        className="absolute inset-x-0 top-0 h-1 rounded-t-2xl"
                        style={{ background: `linear-gradient(90deg, transparent, ${cfg.color}, transparent)` }}
                    />
                    <div
                        className="absolute -top-32 -left-32 w-80 h-80 rounded-full blur-3xl opacity-10 pointer-events-none"
                        style={{ background: cfg.glow }}
                    />

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-6 sm:p-7">
                        {/* avatar */}
                        <div
                            className="relative w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-extrabold shrink-0"
                            style={{
                                background: `linear-gradient(135deg, ${cfg.color}30, ${cfg.color}10)`,
                                border: `2px solid ${cfg.color}60`,
                                boxShadow: `0 0 24px ${cfg.glow}`,
                                color: cfg.color,
                            }}
                        >
                            {initial}
                        </div>

                        {/* info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-3 mb-1">
                                <h2 className="text-xl font-extrabold text-white truncate">{user.username}</h2>
                                <span
                                    className="flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full"
                                    style={{
                                        color: cfg.color,
                                        background: `${cfg.color}18`,
                                        border: `1px solid ${cfg.color}40`,
                                    }}
                                >
                                    <cfg.Icon size={11} />
                                    {user.rank}
                                </span>
                            </div>
                            <p className="text-sm text-[var(--neutral-muted)] truncate">{user.email}</p>
                            <p className="text-xs text-[var(--neutral-muted)]/70 mt-0.5">Member since {joinDate}</p>
                        </div>

                        {/* actions */}
                        <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs text-[var(--neutral-muted)] mb-0.5">Rating</p>
                                <p className="text-lg font-extrabold" style={{ color: cfg.color }}>{user.mmr} MMR</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-2.5 rounded-xl bg-white/5 hover:bg-red-500/15 border border-white/10
                                           hover:border-red-500/30 text-[var(--neutral-muted)] hover:text-red-400
                                           transition-all duration-200"
                                title="Sign out"
                            >
                                <LogOut size={16} />
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* ── Stats row ── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    <StatCard label="Wins"       value={wins}      color="#22c55e" Icon={TrendingUp} index={0} />
                    <StatCard label="Losses"     value={losses}    color="#ef4444" Icon={Shield}     index={1} />
                    <StatCard
                        label="Win Rate"
                        value={winRate}
                        decimals={1}
                        suffix="%"
                        color="#f59e0b"
                        Icon={Star}
                        index={2}
                    />
                    <StatCard
                        label={streakIsHot ? "Hot Streak 🔥" : "Win Streak"}
                        value={winStreak}
                        color={streakIsHot ? "#dc143c" : "#a855f7"}
                        Icon={streakIsHot ? Flame : Zap}
                        index={3}
                    />
                </div>

                {/* ── MMR + Riot + Lobbies grid ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                    <div className="lg:col-span-2">
                        <MmrProgressCard user={user} />
                    </div>
                    <div>
                        <RiotAccountCard user={user} onUpdate={loadProfile} />
                    </div>
                </div>

                <div className="mb-6">
                    <RecentLobbiesCard />
                </div>

                {/* ── Quick actions ── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.65 }}
                    className="flex flex-wrap gap-3"
                >
                    <Link
                        to="/lobbies"
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                                   bg-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/85
                                   text-white transition-all"
                    >
                        <Gamepad2 size={15} /> Browse Tournaments
                    </Link>
                    <Link
                        to="/leaderboard"
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                                   bg-[var(--neutral-surface)]/40 hover:bg-[var(--neutral-surface)]/60
                                   border border-[var(--neutral-border)]/40 text-white transition-all"
                    >
                        <Trophy size={15} /> Leaderboard
                    </Link>
                </motion.div>
            </div>

            <DashboardFooter />
        </div>
    );
}
