import { memo, useEffect, useState } from "react";
import { useParams, NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Flame, Crown, Gem, Award, Shield, Trophy,
    Target, TrendingUp, Swords, Star, Calendar,
    ExternalLink, AlertCircle, Loader, ChevronRight
} from "lucide-react";
import Silk from "../components/ui/Silk";
import { getPublicProfile } from "../services/authService";
import type { User } from "../types";

// ─── Background ───────────────────────────────────────────────────────────────

const ProfileBackground = memo(function ProfileBackground() {
    return (
        <div className="fixed inset-0 z-0 w-screen h-screen overflow-hidden">
            <Silk
                speed={2.5}
                scale={1.3}
                color="#4a0a14"
                noiseIntensity={1.2}
                rotation={0.15}
            />
            <div className="pointer-events-none absolute inset-0 bg-black/35" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(220,20,60,0.40),transparent_45%),radial-gradient(circle_at_75%_20%,rgba(155,48,255,0.15),transparent_45%)]" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-black/15 to-[var(--neutral-bg)]" />
        </div>
    );
});

// ─── Rank helpers ─────────────────────────────────────────────────────────────

type Tier = "elite" | "master" | "diamond" | "platinum" | "gold" | "silver" | "bronze";

function getTier(rank: string): Tier {
    switch (rank) {
        case "Elite":    return "elite";
        case "Master":   return "master";
        case "Diamond":  return "diamond";
        case "Platinum": return "platinum";
        case "Gold":     return "gold";
        case "Silver":   return "silver";
        default:         return "bronze";
    }
}

const TIER_CONFIG: Record<Tier, { icon: typeof Flame; color: string; bg: string }> = {
    elite:    { icon: Flame,   color: "#dc143c", bg: "rgba(220,20,60,0.18)"   },
    master:   { icon: Crown,   color: "#9b30ff", bg: "rgba(155,48,255,0.18)"  },
    diamond:  { icon: Gem,     color: "#b9f2ff", bg: "rgba(185,242,255,0.14)" },
    platinum: { icon: Gem,     color: "#00e5ff", bg: "rgba(0,229,255,0.12)"   },
    gold:     { icon: Trophy,  color: "#ffd700", bg: "rgba(255,215,0,0.14)"   },
    silver:   { icon: Award,   color: "#c0c0c0", bg: "rgba(192,192,192,0.12)" },
    bronze:   { icon: Shield,  color: "#cd7f32", bg: "rgba(205,127,50,0.12)"  },
};

// ─── Riot rank helpers ────────────────────────────────────────────────────────

const RIOT_TIER_COLORS: Record<string, string> = {
    IRON:        "#6b6b6b",
    BRONZE:      "#cd7f32",
    SILVER:      "#c0c0c0",
    GOLD:        "#ffd700",
    PLATINUM:    "#00e5ff",
    EMERALD:     "#50c878",
    DIAMOND:     "#b9f2ff",
    MASTER:      "#9b30ff",
    GRANDMASTER: "#ff4500",
    CHALLENGER:  "#dc143c",
};

function getRiotTierColor(tier: string | null): string {
    if (!tier) return "#6b7280";
    return RIOT_TIER_COLORS[tier.toUpperCase()] ?? "#6b7280";
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
    icon: Icon, label, value, color = "#dc143c", delay = 0
}: {
    icon: typeof Trophy;
    label: string;
    value: string | number;
    color?: string;
    delay?: number;
}) {
    return (
        <motion.div
            className="rounded-2xl border backdrop-blur-xl p-5 flex flex-col gap-3"
            style={{
                background: `linear-gradient(145deg, rgba(17,17,17,0.85) 0%, ${color}08 100%)`,
                borderColor: `${color}30`
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
        >
            <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${color}18`, border: `1px solid ${color}30` }}
            >
                <Icon size={18} style={{ color }} />
            </div>
            <div>
                <p className="text-2xl font-black tracking-tight" style={{ color }}>{value}</p>
                <p className="text-xs text-[var(--neutral-text-muted)] mt-0.5 font-medium">{label}</p>
            </div>
        </motion.div>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Profile() {
    const { username } = useParams<{ username: string }>();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!username) return;
        setLoading(true);
        setError("");
        getPublicProfile(username)
            .then(res => setUser(res.user))
            .catch(err => setError(err.response?.data?.message || "User not found."))
            .finally(() => setLoading(false));
    }, [username]);

    return (
        <div className="min-h-screen text-white relative">
            <ProfileBackground />

            <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 py-12">

                {loading && (
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <Loader size={32} className="text-[var(--brand-primary)] animate-spin" />
                    </div>
                )}

                {error && (
                    <motion.div
                        className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                            <AlertCircle size={28} className="text-red-400" />
                        </div>
                        <h2 className="text-xl font-extrabold">User not found</h2>
                        <p className="text-sm text-[var(--neutral-text-muted)]">{error}</p>
                        <NavLink
                            to="/leaderboard"
                            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--brand-primary)] hover:text-[var(--brand-primary-hover)] transition-colors"
                        >
                            Browse leaderboard <ChevronRight size={14} />
                        </NavLink>
                    </motion.div>
                )}

                {!loading && user && (
                    <div className="space-y-8">

                        {/* Hero header */}
                        <motion.div
                            className="rounded-2xl border backdrop-blur-xl p-8 flex flex-col md:flex-row items-start md:items-center gap-6"
                            style={{
                                background: "linear-gradient(145deg, rgba(17,17,17,0.9) 0%, rgba(220,20,60,0.06) 100%)",
                                borderColor: "rgba(220,20,60,0.25)"
                            }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        >
                            {/* Avatar */}
                            <div
                                className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black flex-shrink-0 shadow-2xl"
                                style={{
                                    background: "linear-gradient(135deg, #dc143c 0%, #8b0000 100%)",
                                    boxShadow: "0 0 40px rgba(220,20,60,0.35)"
                                }}
                            >
                                {user.username.charAt(0).toUpperCase()}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <h1 className="text-3xl font-black tracking-tight truncate">{user.username}</h1>
                                    {user.role === "ADMIN" && (
                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[var(--brand-primary)]/15 text-[var(--brand-primary)] border border-[var(--brand-primary)]/30">
                                            Admin
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 mt-2">
                                    {(() => {
                                        const tier = getTier(user.rank ?? "Bronze");
                                        const cfg = TIER_CONFIG[tier];
                                        const TierIcon = cfg.icon;
                                        return (
                                            <span
                                                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold"
                                                style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}40` }}
                                            >
                                                <TierIcon size={14} /> {user.rank ?? "Bronze"}
                                            </span>
                                        );
                                    })()}
                                    <span className="text-sm text-[var(--neutral-text-muted)]">{user.mmr ?? 0} MMR</span>
                                </div>

                                {user.createdAt && (
                                    <p className="flex items-center gap-1.5 text-xs text-[var(--neutral-text-muted)] mt-3">
                                        <Calendar size={12} />
                                        Joined {new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long" })}
                                    </p>
                                )}
                            </div>
                        </motion.div>

                        {/* Stats grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <StatCard icon={Trophy}     label="MMR"       value={user.mmr ?? 0}                          color="#dc143c" delay={0.05} />
                            <StatCard icon={TrendingUp} label="Win Rate"   value={`${user.winRate ?? 0}%`}                color="#10b981" delay={0.10} />
                            <StatCard icon={Swords}     label="Wins"       value={user.wins ?? 0}                         color="#3b82f6" delay={0.15} />
                            <StatCard icon={Target}     label="Losses"     value={user.losses ?? 0}                       color="#f59e0b" delay={0.20} />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <StatCard icon={Star}       label="Win Streak" value={user.winStreak ?? 0}                    color="#8b5cf6" delay={0.25} />
                            <StatCard icon={Swords}     label="Matches"    value={(user.wins ?? 0) + (user.losses ?? 0)}  color="#6b7280" delay={0.30} />
                            <StatCard icon={Crown}      label="Rank"       value={user.rank ?? "Bronze"}                  color="#ffd700" delay={0.35} />
                        </div>

                        {/* Riot account section */}
                        {user.riotGameName && (
                            <motion.div
                                className="rounded-2xl border backdrop-blur-xl overflow-hidden"
                                style={{
                                    background: "linear-gradient(145deg, rgba(17,17,17,0.9) 0%, rgba(155,48,255,0.06) 100%)",
                                    borderColor: "rgba(155,48,255,0.25)"
                                }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            >
                                <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-[#9b30ff]" />
                                    <h2 className="font-bold text-sm">Riot Games Account</h2>
                                </div>

                                <div className="p-6 flex flex-col md:flex-row gap-6 items-start">
                                    <div className="flex-1 space-y-3">
                                        <div>
                                            <p className="text-xs text-[var(--neutral-text-muted)] mb-1">Summoner</p>
                                            <p className="font-bold text-lg">
                                                {user.riotGameName}
                                                <span className="text-[var(--neutral-text-muted)] font-normal">#{user.riotTagLine}</span>
                                            </p>
                                        </div>
                                        {user.riotPlatform && (
                                            <div>
                                                <p className="text-xs text-[var(--neutral-text-muted)] mb-1">Region</p>
                                                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/5 border border-white/10 uppercase">
                                                    {user.riotPlatform}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {user.riotCachedProfile && (
                                        <div className="flex-1 space-y-3">
                                            {user.riotCachedProfile.tier && (
                                                <div>
                                                    <p className="text-xs text-[var(--neutral-text-muted)] mb-1">LoL Ranked</p>
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className="px-3 py-1 rounded-full text-sm font-black"
                                                            style={{
                                                                color: getRiotTierColor(user.riotCachedProfile.tier),
                                                                background: `${getRiotTierColor(user.riotCachedProfile.tier)}18`,
                                                                border: `1px solid ${getRiotTierColor(user.riotCachedProfile.tier)}40`
                                                            }}
                                                        >
                                                            {user.riotCachedProfile.tier} {user.riotCachedProfile.rank}
                                                        </span>
                                                        <span className="text-sm text-[var(--neutral-text-muted)]">
                                                            {user.riotCachedProfile.leaguePoints} LP
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                            {user.riotCachedProfile.rankedWins != null && (
                                                <div className="flex gap-4 text-sm">
                                                    <span className="text-green-400 font-bold">{user.riotCachedProfile.rankedWins}W</span>
                                                    <span className="text-red-400 font-bold">{user.riotCachedProfile.rankedLosses}L</span>
                                                    {user.riotCachedProfile.hotStreak && (
                                                        <span className="flex items-center gap-1 text-orange-400 font-bold">
                                                            <Flame size={12} /> Hot streak
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                            {user.riotCachedProfile.summonerLevel != null && (
                                                <p className="text-xs text-[var(--neutral-text-muted)]">
                                                    Level {user.riotCachedProfile.summonerLevel}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    <a
                                        href={`https://www.op.gg/summoners/${user.riotPlatform ?? "na"}/${encodeURIComponent(user.riotGameName ?? "")}%23${encodeURIComponent(user.riotTagLine ?? "")}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 text-xs text-[var(--neutral-text-muted)] hover:text-white transition-colors flex-shrink-0"
                                    >
                                        <ExternalLink size={12} /> op.gg
                                    </a>
                                </div>
                            </motion.div>
                        )}

                    </div>
                )}
            </div>
        </div>
    );
}
