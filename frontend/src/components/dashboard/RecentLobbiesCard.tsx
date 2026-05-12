import { motion } from "framer-motion";
import { Trophy, Swords, Crosshair, Zap, ChevronRight } from "lucide-react";
import { NavLink } from "react-router-dom";
import type { Lobby } from "../../types";

const GAME_COLORS: Record<string, { color: string; Icon: typeof Swords }> = {
    league_of_legends: { color: "#3B82F6", Icon: Swords    },
    valorant:          { color: "#FF4655", Icon: Crosshair },
    pokemon_showdown:  { color: "#dc143c", Icon: Zap       },
};

const STATUS_COLOR: Record<string, string> = {
    open:        "text-[var(--brand-primary)]",
    pending:     "text-white/30",
    in_progress: "text-[#3B82F6]",
    completed:   "text-green-400",
    cancelled:   "text-red-400",
};

export default function RecentLobbiesCard({ lobbies }: { lobbies: Lobby[] }) {
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
                                    <span className={"text-xs font-bold capitalize " + (STATUS_COLOR[lobby.status] ?? "text-white/30")}>
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
