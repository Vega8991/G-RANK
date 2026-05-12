import { memo } from "react";
import { motion } from "framer-motion";
import { Calendar, Trophy, Users, LogOut, Swords, Crosshair, Zap, AlertCircle, CheckCircle } from "lucide-react";
import Button from "../common/Button";

export type GameType = "pokemon_showdown" | "league_of_legends" | "valorant";

export interface GameConfig {
    label: string;
    shortLabel: string;
    color: string;
    bg: string;
    Icon: typeof Zap;
    requiresRiot: boolean;
}

export const GAME_CONFIG: Record<GameType, GameConfig> = {
    pokemon_showdown: {
        label: "Pokémon Showdown",
        shortLabel: "Pokémon",
        color: "#dc143c",
        bg: "rgba(220,20,60,0.15)",
        Icon: Zap,
        requiresRiot: false
    },
    league_of_legends: {
        label: "League of Legends",
        shortLabel: "LoL",
        color: "#3B82F6",
        bg: "rgba(59,130,246,0.15)",
        Icon: Swords,
        requiresRiot: true
    },
    valorant: {
        label: "Valorant",
        shortLabel: "Valorant",
        color: "#FF4655",
        bg: "rgba(255,70,85,0.15)",
        Icon: Crosshair,
        requiresRiot: true
    }
};

export type UiLobbyStatus = "open" | "pending" | "in_progress" | "completed" | "cancelled" | "unknown";

const STATUS_LABEL: Record<UiLobbyStatus, string> = {
    open: "registering",
    pending: "pending",
    in_progress: "live",
    completed: "completed",
    cancelled: "cancelled",
    unknown: "no status"
};

const STATUS_COLOR_MAP: Record<UiLobbyStatus, { text: string; bg: string; border: string }> = {
    open:        { text: "var(--brand-primary)",  bg: "rgba(220,20,60,0.12)",   border: "rgba(220,20,60,0.35)"   },
    pending:     { text: "#D1D5DB",               bg: "rgba(31,41,55,0.5)",     border: "rgba(55,65,81,0.8)"     },
    in_progress: { text: "#7FB3FF",               bg: "rgba(37,99,235,0.2)",    border: "rgba(37,99,235,0.4)"    },
    completed:   { text: "rgba(255,255,255,0.3)", bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.08)" },
    cancelled:   { text: "#FCA5A5",               bg: "rgba(127,29,29,0.3)",    border: "rgba(185,28,28,0.4)"    },
    unknown:     { text: "#E5E7EB",               bg: "rgba(31,41,55,0.4)",     border: "rgba(55,65,81,0.8)"     }
};

export type LobbyCardData = {
    _id: string;
    name: string;
    description: string;
    status: UiLobbyStatus;
    currentParticipants: number;
    maxParticipants: number;
    createdByName: string;
    prizePoolLabel: string;
    formattedMatchDate: string;
    game: GameType;
};

export type LobbyCardProps = {
    lobby: LobbyCardData;
    isRegistered: boolean;
    userRiotLinked: boolean | null;
    onRegister: (id: string) => Promise<void>;
    onLeave: (id: string) => Promise<void>;
    index: number;
};

function getCardAction(
    status: UiLobbyStatus,
    isRegistered: boolean,
    isFull: boolean
): { label: string; variant: "primary" | "outline"; disabled: boolean } {
    if (status === "open") {
        if (isRegistered) return { label: "Already registered", variant: "outline", disabled: true };
        if (isFull)       return { label: "Slots full",         variant: "outline", disabled: true };
        return { label: "Register now", variant: "primary", disabled: false };
    }
    if (status === "pending")     return { label: "Waiting to start", variant: "outline", disabled: true };
    if (status === "in_progress") return { label: "In progress",      variant: "outline", disabled: true };
    if (status === "completed")   return { label: "View results",     variant: "outline", disabled: true };
    if (status === "cancelled")   return { label: "Cancelled",        variant: "outline", disabled: true };
    return { label: "Coming soon", variant: "outline", disabled: true };
}

const LobbyCard = memo(function LobbyCard({ lobby, isRegistered, userRiotLinked, onRegister, onLeave, index }: LobbyCardProps) {
    const isFull = lobby.maxParticipants > 0 && lobby.currentParticipants >= lobby.maxParticipants;
    const action = getCardAction(lobby.status, isRegistered, isFull);
    const gameCfg = GAME_CONFIG[lobby.game];
    const GameIcon = gameCfg.Icon;
    const needsRiot = gameCfg.requiresRiot;
    const riotMissing = needsRiot && userRiotLinked === false;
    const riotOk = needsRiot && userRiotLinked === true;
    const statusStyle = STATUS_COLOR_MAP[lobby.status];
    const fillPct = lobby.maxParticipants > 0 ? (lobby.currentParticipants / lobby.maxParticipants) * 100 : 0;
    const hasPrize = lobby.prizePoolLabel !== "No prize";

    return (
        <motion.article
            className="group relative rounded-2xl overflow-hidden flex flex-col"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -4 }}
        >
            <div className="h-[2px] w-full shrink-0" style={{ background: `linear-gradient(90deg, ${gameCfg.color}, ${gameCfg.color}50, transparent)` }} />

            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                style={{ background: `radial-gradient(ellipse at 50% 0%, ${gameCfg.color}10, transparent 70%)` }}
            />

            <div
                className="flex flex-col flex-1 p-5 border-x border-b border-white/6 rounded-b-2xl backdrop-blur-lg"
                style={{ background: "linear-gradient(160deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)" }}
            >
                <div className="flex items-start justify-between gap-3 mb-1">
                    <h3 className="text-xl font-black leading-tight tracking-tight text-white">{lobby.name}</h3>
                    <div className="flex items-center gap-2 shrink-0">
                        <span
                            className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full"
                            style={{ color: gameCfg.color, backgroundColor: gameCfg.color + "18", border: `1px solid ${gameCfg.color}35` }}
                        >
                            <GameIcon size={10} />
                            {gameCfg.shortLabel}
                        </span>
                        <span
                            className="capitalize text-[10px] font-bold px-2.5 py-1 rounded-full"
                            style={{ color: statusStyle.text, backgroundColor: statusStyle.bg, border: `1px solid ${statusStyle.border}` }}
                        >
                            {STATUS_LABEL[lobby.status]}
                        </span>
                    </div>
                </div>

                <p className="text-xs text-white/25 mb-3">by {lobby.createdByName}</p>

                {riotMissing && (
                    <div className="flex items-start gap-2 rounded-xl px-3 py-2.5 mb-3" style={{ border: "1px solid rgba(245,158,11,0.2)", background: "rgba(245,158,11,0.06)" }}>
                        <AlertCircle size={13} className="text-amber-400 mt-0.5 shrink-0" />
                        <p className="text-xs text-amber-300/80 leading-relaxed">
                            Requires a <span className="font-semibold text-amber-300">linked Riot account</span>.{" "}
                            <a href="/dashboard" className="underline underline-offset-2 hover:text-amber-100 transition-colors">Link in profile →</a>
                        </p>
                    </div>
                )}
                {riotOk && (
                    <div className="flex items-center gap-2 rounded-xl px-3 py-2 mb-3" style={{ border: "1px solid rgba(34,197,94,0.2)", background: "rgba(34,197,94,0.06)" }}>
                        <CheckCircle size={13} className="text-green-400 shrink-0" />
                        <p className="text-xs text-green-300">Riot account linked — ready to compete</p>
                    </div>
                )}
                {needsRiot && userRiotLinked === null && (
                    <div className="flex items-center gap-2 rounded-xl px-3 py-2 mb-3" style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
                        <AlertCircle size={13} className="text-white/20 shrink-0" />
                        <p className="text-xs text-white/30">Requires a linked Riot account</p>
                    </div>
                )}

                <p className="text-sm text-white/45 leading-relaxed flex-1 mb-5">{lobby.description}</p>

                <div className="space-y-2.5 mb-4">
                    <div className="flex items-center gap-2 text-xs text-white/35">
                        <Calendar size={13} />
                        <span>{lobby.formattedMatchDate}</span>
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs text-white/35">
                            <div className="flex items-center gap-2">
                                <Users size={13} />
                                <span>{lobby.currentParticipants}/{lobby.maxParticipants} players</span>
                            </div>
                            {isFull && <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "var(--brand-primary)" }}>FULL</span>}
                        </div>
                        {lobby.maxParticipants > 0 && (
                            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                                <div
                                    className="h-full rounded-full transition-all duration-700"
                                    style={{ width: `${fillPct}%`, background: isFull ? "var(--brand-primary)" : `linear-gradient(90deg, ${gameCfg.color}80, ${gameCfg.color})` }}
                                />
                            </div>
                        )}
                    </div>

                    {hasPrize && (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold" style={{ color: "var(--brand-primary)", background: "rgba(220,20,60,0.1)", border: "1px solid rgba(220,20,60,0.2)" }}>
                            <Trophy size={12} />
                            {lobby.prizePoolLabel}
                        </div>
                    )}
                </div>

                <div className="flex gap-2 mt-auto">
                    <Button
                        variant={action.variant}
                        className={"py-2.5 text-sm font-bold " + (isRegistered && lobby.status === "open" ? "flex-1" : "w-full")}
                        disabled={action.disabled}
                        onClick={function () {
                            if (action.label === "Register now") onRegister(lobby._id);
                        }}
                    >
                        {action.label}
                    </Button>
                    {isRegistered && lobby.status === "open" && (
                        <Button
                            variant="outline"
                            className="py-2.5 px-4 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
                            onClick={function () { onLeave(lobby._id); }}
                        >
                            <LogOut size={15} />
                            Leave
                        </Button>
                    )}
                </div>
            </div>
        </motion.article>
    );
});

export default LobbyCard;
