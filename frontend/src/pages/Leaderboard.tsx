import { memo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Flame, Crown, Gem, Award, Shield, Trophy } from "lucide-react";
import { NavLink } from "react-router-dom";
import Silk from "../components/ui/Silk";
import { getLeaderboard, type LeaderboardPlayer } from "../services/leaderboardService";

// ─── Tier derivation ──────────────────────────────────────────────────────────

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
    elite:    { icon: Flame,   color: "#dc143c", bg: "rgba(220,20,60,0.18)"    },
    master:   { icon: Crown,   color: "#9b30ff", bg: "rgba(155,48,255,0.18)"   },
    diamond:  { icon: Gem,     color: "#b9f2ff", bg: "rgba(185,242,255,0.14)"  },
    platinum: { icon: Gem,     color: "#00e5ff", bg: "rgba(0,229,255,0.12)"    },
    gold:     { icon: Trophy,  color: "#ffd700", bg: "rgba(255,215,0,0.14)"    },
    silver:   { icon: Award,   color: "#c0c0c0", bg: "rgba(192,192,192,0.12)"  },
    bronze:   { icon: Shield,  color: "#cd7f32", bg: "rgba(205,127,50,0.12)"   },
};

const RANK_1_COLOR = "#ffd700";
const RANK_2_COLOR = "#9ca3af";
const RANK_3_COLOR = "#cd7f32";

function getRankAccentColor(pos: number): string {
    if (pos === 1) return RANK_1_COLOR;
    if (pos === 2) return RANK_2_COLOR;
    return RANK_3_COLOR;
}

// ─── Background ───────────────────────────────────────────────────────────────

const LeaderboardBackground = memo(function LeaderboardBackground() {
    return (
        <div className="fixed inset-0 z-0 w-screen h-screen overflow-hidden">
            <Silk
                speed={2.5}
                scale={1.3}
                color="#4a0a14"
                noiseIntensity={1.2}
                rotation={0.15}
            />
            <div className="pointer-events-none absolute inset-0 bg-black/30" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(220,20,60,0.45),transparent_45%),radial-gradient(circle_at_75%_20%,rgba(155,48,255,0.20),transparent_45%),radial-gradient(circle_at_50%_70%,rgba(180,10,40,0.20),transparent_55%)]" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-black/15 to-[var(--neutral-bg)]" />
        </div>
    );
});

// ─── Podium card (top 3) ──────────────────────────────────────────────────────

function PodiumCard({ player, pos, index }: { player: LeaderboardPlayer; pos: number; index: number }) {
    const accentColor = getRankAccentColor(pos);
    const tierCfg = TIER_CONFIG[getTier(player.rank)];
    const TierIcon = tierCfg.icon;
    const isFirst = pos === 1;

    return (
        <motion.div
            className="group relative rounded-2xl p-6 backdrop-blur-xl border transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl"
            style={{
                background: `linear-gradient(145deg, rgba(17,17,17,0.9) 0%, ${accentColor}08 100%)`,
                borderColor: `${accentColor}35`,
                boxShadow: isFirst
                    ? `0 0 40px ${accentColor}18, 0 8px 30px rgba(0,0,0,0.5)`
                    : `0 8px 30px rgba(0,0,0,0.5)`
            }}
            initial={{ opacity: 0, y: 40, scaleY: 0.95 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            transition={{ duration: 0.85, delay: 0.15 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ boxShadow: `0 0 50px ${accentColor}25, 0 20px 50px rgba(0,0,0,0.6)` }}
        >
            <div className="flex items-start justify-between mb-4">
                <span className="text-3xl font-extrabold" style={{ color: accentColor }}>
                    #{pos}
                </span>
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300"
                    style={{ background: tierCfg.bg, border: `1px solid ${tierCfg.color}40` }}
                >
                    <TierIcon size={18} style={{ color: tierCfg.color }} />
                </div>
            </div>

            <h3 className="text-xl font-extrabold mb-5 text-white">{player.username}</h3>

            <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--neutral-text-muted)]">MMR</span>
                    <span className="font-bold text-[#dc143c]">{player.mmr.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--neutral-text-muted)]">Win Rate</span>
                    <span className="font-semibold text-white">{player.winRate.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--neutral-text-muted)]">W/L</span>
                    <span className="font-semibold text-[var(--neutral-text-secondary)]">{player.wins}/{player.losses}</span>
                </div>
            </div>

            {isFirst && (
                <div
                    className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `linear-gradient(145deg, ${accentColor}06 0%, transparent 60%)` }}
                />
            )}
        </motion.div>
    );
}

// ─── Table row ────────────────────────────────────────────────────────────────

function TableRow({ player, pos, index }: { player: LeaderboardPlayer; pos: number; index: number }) {
    const tierCfg = TIER_CONFIG[getTier(player.rank)];
    const TierIcon = tierCfg.icon;

    return (
        <motion.tr
            className="group border-b border-[var(--neutral-border)]/25 hover:bg-[var(--neutral-surface)]/40 transition-colors duration-200"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.35 + index * 0.055, ease: [0.16, 1, 0.3, 1] }}
        >
            <td className="py-4 px-5 w-16">
                <span className="text-sm font-semibold text-[var(--neutral-text-secondary)]">
                    {pos}
                </span>
            </td>

            <td className="py-4 px-5">
                <div className="flex items-center gap-3">
                    <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-105"
                        style={{ backgroundColor: tierCfg.bg }}
                    >
                        <TierIcon size={17} style={{ color: tierCfg.color }} />
                    </div>
                    <span className="text-sm font-semibold text-white">{player.username}</span>
                </div>
            </td>

            <td className="py-4 px-5">
                <span className="text-sm font-bold text-[#dc143c]">{player.mmr.toLocaleString()}</span>
            </td>

            <td className="py-4 px-5">
                <span className="text-sm text-[var(--neutral-text-secondary)]">{player.wins}/{player.losses}</span>
            </td>

            <td className="py-4 px-5">
                <span className="text-sm font-semibold text-white">{player.winRate.toFixed(1)}%</span>
            </td>

            {player.country && (
                <td className="py-4 px-5">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-[var(--neutral-surface)]/60 border border-[var(--neutral-border)]/40 text-[var(--neutral-text-secondary)]">
                        {player.country}
                    </span>
                </td>
            )}
        </motion.tr>
    );
}

// ─── Skeleton loaders ─────────────────────────────────────────────────────────

function PodiumSkeleton() {
    return (
        <div className="rounded-2xl p-6 backdrop-blur-xl border border-white/10 bg-white/5 animate-pulse">
            <div className="h-8 w-12 rounded bg-white/10 mb-4" />
            <div className="h-6 w-32 rounded bg-white/10 mb-5" />
            <div className="space-y-2">
                {[1, 2, 3].map(i => <div key={i} className="h-4 rounded bg-white/10" />)}
            </div>
        </div>
    );
}

function RowSkeleton({ index }: { index: number }) {
    return (
        <tr className="border-b border-[var(--neutral-border)]/25">
            <td className="py-4 px-5"><div className="h-4 w-6 rounded bg-white/10 animate-pulse" style={{ animationDelay: `${index * 40}ms` }} /></td>
            <td className="py-4 px-5"><div className="h-4 w-36 rounded bg-white/10 animate-pulse" style={{ animationDelay: `${index * 40}ms` }} /></td>
            <td className="py-4 px-5"><div className="h-4 w-16 rounded bg-white/10 animate-pulse" style={{ animationDelay: `${index * 40}ms` }} /></td>
            <td className="py-4 px-5"><div className="h-4 w-14 rounded bg-white/10 animate-pulse" style={{ animationDelay: `${index * 40}ms` }} /></td>
            <td className="py-4 px-5"><div className="h-4 w-12 rounded bg-white/10 animate-pulse" style={{ animationDelay: `${index * 40}ms` }} /></td>
            <td className="py-4 px-5"><div className="h-4 w-10 rounded bg-white/10 animate-pulse" style={{ animationDelay: `${index * 40}ms` }} /></td>
        </tr>
    );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function LeaderboardFooter() {
    return (
        <footer className="border-t border-[var(--neutral-border)]/40 bg-[var(--neutral-surface)]/40 backdrop-blur-xl">
            <div className="max-w-[1512px] mx-auto px-6 md:px-20 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-4 group cursor-pointer">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-primary)]/70 flex items-center justify-center shadow-lg shadow-[var(--brand-primary)]/30 transition-all duration-500 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-[var(--brand-primary)]/50">
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
                            <NavLink to="/" className="block text-sm text-[var(--neutral-text-secondary)] hover:text-white hover:translate-x-1 transition-all duration-300">Pokémon Showdown</NavLink>
                            <NavLink to="/" className="block text-sm text-[var(--neutral-text-secondary)] hover:text-white hover:translate-x-1 transition-all duration-300">League of Legends</NavLink>
                            <NavLink to="/" className="block text-sm text-[var(--neutral-text-secondary)] hover:text-white hover:translate-x-1 transition-all duration-300">Valorant</NavLink>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-sm mb-4 text-[var(--neutral-text)] tracking-wide">TIERS</h4>
                        <div className="space-y-3">
                            <NavLink to="/" className="block text-sm text-[var(--neutral-text-secondary)] hover:text-white hover:translate-x-1 transition-all duration-300">Bronze → Silver → Gold</NavLink>
                            <NavLink to="/" className="block text-sm text-[var(--neutral-text-secondary)] hover:text-white hover:translate-x-1 transition-all duration-300">Platinum → Diamond</NavLink>
                            <NavLink to="/" className="block text-sm text-[var(--neutral-text-secondary)] hover:text-white hover:translate-x-1 transition-all duration-300">Master → Elite</NavLink>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-[var(--neutral-border)]/30 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-[var(--neutral-text-muted)]">
                        © 2025 G-RANK. ALL RIGHTS RESERVED.
                    </p>
                </div>
            </div>
        </footer>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Leaderboard() {
    const [players, setPlayers] = useState<LeaderboardPlayer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getLeaderboard(50)
            .then(setPlayers)
            .catch(() => setError("Failed to load leaderboard"))
            .finally(() => setLoading(false));
    }, []);

    const top3   = players.slice(0, 3);
    const rest   = players.slice(3);

    return (
        <div className="relative bg-[var(--neutral-bg)] text-white min-h-[calc(100vh-64px)]">
            <LeaderboardBackground />

            <div className="relative z-10 pointer-events-auto">
                <section className="max-w-[1512px] mx-auto px-6 md:px-20 pt-12 pb-4">
                    <motion.div
                        initial={{ opacity: 0, y: 28 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-2">Leaderboard</h1>
                        {!loading && !error && (
                            <p className="text-sm text-[var(--neutral-text-muted)] mb-8">
                                {players.length} ranked players
                            </p>
                        )}
                    </motion.div>
                </section>

                <section className="max-w-[1512px] mx-auto px-6 md:px-20 py-10">
                    {/* ── Podium ── */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
                        {loading
                            ? [0, 1, 2].map(i => <PodiumSkeleton key={i} />)
                            : top3.map((p, i) => (
                                <PodiumCard key={p._id} player={p} pos={i + 1} index={i} />
                            ))
                        }
                    </div>

                    {/* ── Rankings table ── */}
                    {error ? (
                        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center">
                            <p className="text-red-400">{error}</p>
                        </div>
                    ) : (
                        <motion.div
                            className="rounded-2xl border border-[var(--neutral-border)]/40 bg-[var(--neutral-surface)]/35 backdrop-blur-xl overflow-hidden"
                            initial={{ opacity: 0, y: 30, scaleY: 0.97 }}
                            animate={{ opacity: 1, y: 0, scaleY: 1 }}
                            style={{ originY: 0 }}
                            transition={{ duration: 0.85, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-[var(--neutral-border)]/40 bg-[var(--neutral-surface)]/30">
                                        <th className="py-3.5 px-5 text-left text-xs font-bold text-[var(--neutral-text-muted)] tracking-wider uppercase w-16">#</th>
                                        <th className="py-3.5 px-5 text-left text-xs font-bold text-[var(--neutral-text-muted)] tracking-wider uppercase">Player</th>
                                        <th className="py-3.5 px-5 text-left text-xs font-bold text-[var(--neutral-text-muted)] tracking-wider uppercase">MMR</th>
                                        <th className="py-3.5 px-5 text-left text-xs font-bold text-[var(--neutral-text-muted)] tracking-wider uppercase">W/L</th>
                                        <th className="py-3.5 px-5 text-left text-xs font-bold text-[var(--neutral-text-muted)] tracking-wider uppercase">Win Rate</th>
                                        <th className="py-3.5 px-5 text-left text-xs font-bold text-[var(--neutral-text-muted)] tracking-wider uppercase">Country</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading
                                        ? Array.from({ length: 10 }, (_, i) => <RowSkeleton key={i} index={i} />)
                                        : rest.map((p, i) => (
                                            <TableRow key={p._id} player={p} pos={i + 4} index={i} />
                                        ))
                                    }
                                </tbody>
                            </table>
                        </motion.div>
                    )}
                </section>

                <LeaderboardFooter />
            </div>
        </div>
    );
}
