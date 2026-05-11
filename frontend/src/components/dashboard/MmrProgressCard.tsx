import { motion } from "framer-motion";
import { BarChart3, Sparkles, Trophy, Star, Gem, Crown, Flame, Award } from "lucide-react";
import type { User } from "../../types";
import type { LucideIcon } from "lucide-react";

const RANK_CONFIG = {
    Bronze:   { color: "#cd7f32", glow: "rgba(205,127,50,0.35)",  Icon: Award  as LucideIcon, min: 0,    max: 499,      next: "Silver",   nextMin: 500  },
    Silver:   { color: "#c0c0c0", glow: "rgba(192,192,192,0.30)", Icon: Star   as LucideIcon, min: 500,  max: 999,      next: "Gold",     nextMin: 1000 },
    Gold:     { color: "#ffd700", glow: "rgba(255,215,0,0.35)",   Icon: Trophy as LucideIcon, min: 1000, max: 1499,     next: "Platinum", nextMin: 1500 },
    Platinum: { color: "#e5e4e2", glow: "rgba(229,228,226,0.30)", Icon: Gem    as LucideIcon, min: 1500, max: 1999,     next: "Diamond",  nextMin: 2000 },
    Diamond:  { color: "#b9f2ff", glow: "rgba(185,242,255,0.30)", Icon: Gem    as LucideIcon, min: 2000, max: 2499,     next: "Master",   nextMin: 2500 },
    Master:   { color: "#9b30ff", glow: "rgba(155,48,255,0.35)",  Icon: Crown  as LucideIcon, min: 2500, max: 2999,     next: "Elite",    nextMin: 3000 },
    Elite:    { color: "#dc143c", glow: "rgba(220,20,60,0.40)",   Icon: Flame  as LucideIcon, min: 3000, max: Infinity, next: null,       nextMin: null },
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

export default function MmrProgressCard({ user }: { user: User }) {
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
