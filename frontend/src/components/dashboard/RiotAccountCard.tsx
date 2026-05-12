import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AxiosError } from "axios";
import { Swords, TrendingUp, CheckCircle, AlertCircle, Unlink, Shield, Flame, Crosshair } from "lucide-react";
import { linkRiotAccount, unlinkRiotAccount, getMyRiotProfile } from "../../services/riotService";
import type { User, RiotPlatform } from "../../types";

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

const TIER_COLOR: Record<string, string> = {
    IRON: "#6b7280", BRONZE: "#cd7f32", SILVER: "#c0c0c0", GOLD: "#ffd700",
    PLATINUM: "#22d3ee", EMERALD: "#10b981", DIAMOND: "#b9f2ff",
    MASTER: "#9b30ff", GRANDMASTER: "#dc143c", CHALLENGER: "#38bdf8",
};

function RiotRankedBadge({ tier, rank, lp }: { tier: string | null; rank: string | null; lp: number | null }) {
    if (!tier) return <span className="text-xs text-white/30 italic">Unranked</span>;
    const color = TIER_COLOR[tier] ?? "#c0c0c0";
    const showRank = !["MASTER", "GRANDMASTER", "CHALLENGER"].includes(tier);
    return (
        <span className="text-sm font-extrabold" style={{ color }}>
            {tier}{showRank ? ` ${rank}` : ""} — {lp ?? 0} LP
        </span>
    );
}

interface RiotAccountCardProps {
    user: User;
    onUpdate: () => void;
}

export default function RiotAccountCard({ user, onUpdate }: RiotAccountCardProps) {
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
            setMsg({ text: axiosErr.response?.data?.message ?? "Failed to link account. Check name, tag and region.", ok: false });
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
            setMsg({ text: axiosErr.response?.data?.message ?? "Riot API unavailable. Try again later.", ok: false });
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
                                            { label: "Win%", content: rankedWinPct !== null ? <span className="text-sm font-bold" style={{ color: rankedWinPct >= 50 ? "var(--status-success)" : "#ef4444" }}>{rankedWinPct}%</span> : <span className="text-xs text-white/20">—</span> },
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
