import { memo } from "react";
import { motion } from "framer-motion";
import { Flame, Crown, Gem, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { NavLink } from "react-router-dom";
import Silk from "../components/ui/Silk";

type Trend = "up" | "down" | "neutral";
type Tier = "elite" | "master" | "diamond";

interface TopPlayer {
    rank: number;
    username: string;
    mmr: number;
    winRate: number;
    wins: number;
    losses: number;
}

interface TablePlayer {
    rank: number;
    username: string;
    mmr: number;
    wins: number;
    losses: number;
    winRate: number;
    country: string;
    trend: Trend;
    tier: Tier;
}

const TOP_3: TopPlayer[] = [
    { rank: 1, username: "Trembosil", mmr: 3245, winRate: 71, wins: 284, losses: 116 },
    { rank: 2, username: "PepinoGamer", mmr: 3198, winRate: 68, wins: 312, losses: 145 },
    { rank: 3, username: "KingWolf678", mmr: 2847, winRate: 67, wins: 256, losses: 124 }
];

const TABLE_PLAYERS: TablePlayer[] = [
    { rank: 1, username: "ShadowMaster", mmr: 3245, wins: 284, losses: 116, winRate: 71, country: "USA", trend: "up", tier: "elite" },
    { rank: 2, username: "ThunderKing", mmr: 3198, wins: 312, losses: 145, winRate: 68, country: "KOR", trend: "neutral", tier: "elite" },
    { rank: 3, username: "ProPlayer", mmr: 2847, wins: 256, losses: 124, winRate: 67, country: "USA", trend: "up", tier: "master" },
    { rank: 4, username: "PhantomStrike", mmr: 2756, wins: 198, losses: 102, winRate: 66, country: "JPN", trend: "down", tier: "master" },
    { rank: 5, username: "IceQueen", mmr: 2689, wins: 223, losses: 127, winRate: 64, country: "SWE", trend: "up", tier: "master" },
    { rank: 6, username: "FireDragon", mmr: 2634, wins: 201, losses: 115, winRate: 64, country: "CHN", trend: "neutral", tier: "master" },
    { rank: 7, username: "StormRider", mmr: 2578, wins: 187, losses: 108, winRate: 63, country: "BRA", trend: "up", tier: "master" },
    { rank: 8, username: "NightHawk", mmr: 2512, wins: 176, losses: 104, winRate: 63, country: "GER", trend: "down", tier: "diamond" },
    { rank: 9, username: "PaqueteDeCamel", mmr: 2467, wins: 165, losses: 98, winRate: 63, country: "RUS", trend: "up", tier: "diamond" },
    { rank: 10, username: "Achichocraft", mmr: 2423, wins: 154, losses: 91, winRate: 63, country: "MEX", trend: "neutral", tier: "diamond" }
];

const RANK_1_COLOR = "#ffd700";
const RANK_2_COLOR = "#9ca3af";
const RANK_3_COLOR = "#cd7f32";

const TIER_CONFIG: Record<Tier, { icon: typeof Flame; color: string; bg: string }> = {
    elite: { icon: Flame, color: "#dc143c", bg: "rgba(220,20,60,0.18)" },
    master: { icon: Crown, color: "#9b30ff", bg: "rgba(155,48,255,0.18)" },
    diamond: { icon: Gem, color: "#b9f2ff", bg: "rgba(185,242,255,0.14)" }
};

function getRankAccentColor(rank: number): string {
    if (rank === 1) return RANK_1_COLOR;
    if (rank === 2) return RANK_2_COLOR;
    return RANK_3_COLOR;
}

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

interface PodiumCardProps {
    player: TopPlayer;
    index: number;
}

function PodiumCard({ player, index }: PodiumCardProps) {
    const accentColor = getRankAccentColor(player.rank);
    const rankLabel = player.rank === 1 ? "1" : player.rank === 2 ? "2" : "3";
    const isFirst = player.rank === 1;

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
            whileHover={{
                boxShadow: `0 0 50px ${accentColor}25, 0 20px 50px rgba(0,0,0,0.6)`
            }}
        >
            <div className="flex items-start justify-between mb-4">
                <span
                    className="text-3xl font-extrabold"
                    style={{ color: accentColor }}
                >
                    #{rankLabel}
                </span>
                <div className="w-10 h-10 rounded-xl bg-[#dc143c] flex items-center justify-center shadow-lg shadow-[#dc143c]/40 group-hover:scale-105 transition-transform duration-300">
                    <Crown size={18} className="text-white" />
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
                    <span className="font-semibold text-white">{player.winRate}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--neutral-text-muted)]">W/L</span>
                    <span className="font-semibold text-[var(--neutral-text-secondary)]">{player.wins}/{player.losses}</span>
                </div>
            </div>

            {isFirst && (
                <div
                    className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                        background: `linear-gradient(145deg, ${accentColor}06 0%, transparent 60%)`
                    }}
                />
            )}
        </motion.div>
    );
}

interface TrendIconProps {
    trend: Trend;
}

function TrendIcon({ trend }: TrendIconProps) {
    if (trend === "up") {
        return (
            <span className="inline-flex items-center">
                <TrendingUp size={14} className="text-[var(--status-success)]" />
            </span>
        );
    }
    if (trend === "down") {
        return (
            <span className="inline-flex items-center">
                <TrendingDown size={14} className="text-[#ef4444]" />
            </span>
        );
    }
    return (
        <span className="inline-flex items-center">
            <Minus size={14} className="text-[var(--neutral-text-muted)]" />
        </span>
    );
}

interface TableRowProps {
    player: TablePlayer;
    index: number;
}

function TableRow({ player, index }: TableRowProps) {
    const tierCfg = TIER_CONFIG[player.tier];
    const TierIcon = tierCfg.icon;

    return (
        <motion.tr
            className="group border-b border-[var(--neutral-border)]/25 hover:bg-[var(--neutral-surface)]/40 transition-colors duration-200"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.35 + index * 0.055, ease: [0.16, 1, 0.3, 1] }}
        >
            <td className="py-4 px-5 w-20">
                <div className="flex items-center gap-2">
                    <TrendIcon trend={player.trend} />
                    <span className="text-sm font-semibold text-[var(--neutral-text-secondary)]">
                        {player.rank}
                    </span>
                </div>
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
                <span className="text-sm font-semibold text-white">{player.winRate}%</span>
            </td>

            <td className="py-4 px-5">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-[var(--neutral-surface)]/60 border border-[var(--neutral-border)]/40 text-[var(--neutral-text-secondary)]">
                    {player.country}
                </span>
            </td>

            <td className="py-4 px-5 text-right">
                <button className="text-xs font-semibold text-[#dc143c] hover:text-white transition-colors duration-200 hover:underline underline-offset-2">
                    View Profile
                </button>
            </td>
        </motion.tr>
    );
}

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
                            <NavLink to="/" className="block text-sm text-[var(--neutral-text-secondary)] hover:text-white hover:translate-x-1 transition-all duration-300">Fortnite</NavLink>
                            <NavLink to="/" className="block text-sm text-[var(--neutral-text-secondary)] hover:text-white hover:translate-x-1 transition-all duration-300">Rocket League</NavLink>
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

export default function Leaderboard() {
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
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-8">Leaderboard</h1>
                    </motion.div>
                </section>

                <section className="max-w-[1512px] mx-auto px-6 md:px-20 py-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
                        {TOP_3.map(function (player, index) {
                            return (
                                <PodiumCard key={player.username} player={player} index={index} />
                            );
                        })}
                    </div>

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
                                    <th className="py-3.5 px-5 text-left text-xs font-bold text-[var(--neutral-text-muted)] tracking-wider uppercase w-20">Rank</th>
                                    <th className="py-3.5 px-5 text-left text-xs font-bold text-[var(--neutral-text-muted)] tracking-wider uppercase">Player</th>
                                    <th className="py-3.5 px-5 text-left text-xs font-bold text-[var(--neutral-text-muted)] tracking-wider uppercase">MMR</th>
                                    <th className="py-3.5 px-5 text-left text-xs font-bold text-[var(--neutral-text-muted)] tracking-wider uppercase">W/L</th>
                                    <th className="py-3.5 px-5 text-left text-xs font-bold text-[var(--neutral-text-muted)] tracking-wider uppercase">Win Rate</th>
                                    <th className="py-3.5 px-5 text-left text-xs font-bold text-[var(--neutral-text-muted)] tracking-wider uppercase">Country</th>
                                    <th className="py-3.5 px-5" />
                                </tr>
                            </thead>
                            <tbody>
                                {TABLE_PLAYERS.map(function (player, index) {
                                    return (
                                        <TableRow key={player.username} player={player} index={index} />
                                    );
                                })}
                            </tbody>
                        </table>
                    </motion.div>
                </section>

                <LeaderboardFooter />
            </div>
        </div>
    );
}
