import { memo, useCallback, useDeferredValue, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { AxiosError } from "axios";
import { motion } from "framer-motion";
import { Calendar, Filter, Search, Trophy, Users, CheckCircle2, Plus, LogOut, Swords, Crosshair, Zap, AlertCircle, CheckCircle } from "lucide-react";
import Button from "../components/common/Button";
import Silk from "../components/ui/Silk";
import { createLobby, getAllLobbies, getMyLobbies, registerToLobby, leaveLobby, syncParticipantCounts } from "../services/lobbyService";
import { submitReplay } from "../services/matchService";
import { getProfile } from "../services/authService";
import type { MatchResultResponse, Lobby } from "../types";

type GameType = "pokemon_showdown" | "league_of_legends" | "valorant";

interface GameConfig {
    label: string;
    shortLabel: string;
    color: string;
    bg: string;
    Icon: typeof Zap;
    requiresRiot: boolean;
}

const GAME_CONFIG: Record<GameType, GameConfig> = {
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

function normalizeGame(game: unknown): GameType {
    if (game === "league_of_legends" || game === "valorant") return game;
    return "pokemon_showdown";
}

type UiLobbyStatus = "open" | "pending" | "in_progress" | "completed" | "cancelled" | "unknown";
type LobbyStatusFilter = "all" | UiLobbyStatus;

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

const FILTERS: Array<{ value: LobbyStatusFilter; label: string }> = [
    { value: "all",         label: "All"         },
    { value: "open",        label: "Registering" },
    { value: "pending",     label: "Pending"     },
    { value: "in_progress", label: "Live"        },
    { value: "completed",   label: "Completed"   },
    { value: "cancelled",   label: "Cancelled"   }
];

function getErrorMessage(err: unknown): string {
    const axiosErr = err as AxiosError<{ message?: string }>;
    return axiosErr.response?.data?.message || "Error";
}

function formatDate(value: string): string {
    if (!value) return "Date pending";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Date pending";
    return date.toLocaleString("es-ES", { month: "short", day: "numeric", year: "numeric" });
}

function normalizeStatus(status: unknown): UiLobbyStatus {
    if (status === "open" || status === "pending" || status === "in_progress" || status === "completed" || status === "cancelled") {
        return status;
    }
    return "unknown";
}

function hasLobbyId(value: unknown): value is Lobby {
    if (!value || typeof value !== "object") return false;
    const record = value as { _id?: unknown };
    return typeof record._id === "string" && record._id.length > 0;
}

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

const LobbiesBackground = memo(function LobbiesBackground() {
    return (
        <div className="fixed inset-0 z-0 w-screen h-screen overflow-hidden">
            <Silk speed={3} scale={1.2} color="#7a0e1e" noiseIntensity={1.5} rotation={0.3} />
            <div className="pointer-events-none absolute inset-0 bg-black/25" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(220,20,60,0.55),transparent_45%),radial-gradient(circle_at_80%_15%,rgba(220,20,60,0.35),transparent_45%),radial-gradient(circle_at_50%_60%,rgba(180,10,40,0.25),transparent_55%)]" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-[var(--neutral-bg)]" />
            {/* Scanlines */}
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.02]"
                style={{
                    backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.8) 2px, rgba(255,255,255,0.8) 3px)",
                    backgroundSize: "100% 3px"
                }}
            />
        </div>
    );
});

type LobbyCardData = {
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

function normalizeLobbyForCard(lobby: Lobby): LobbyCardData {
    return {
        _id: lobby._id,
        name: lobby.name || "Untitled lobby",
        description: lobby.description || "No description available.",
        status: normalizeStatus(lobby.status),
        currentParticipants: Number(lobby.currentParticipants) || 0,
        maxParticipants: Number(lobby.maxParticipants) || 0,
        createdByName: typeof lobby.createdBy === "object" && lobby.createdBy !== null ? lobby.createdBy.username : "Unknown",
        prizePoolLabel: lobby.prizePool || "No prize",
        formattedMatchDate: formatDate(lobby.matchDateTime),
        game: normalizeGame(lobby.game)
    };
}

type LobbyCardProps = {
    lobby: LobbyCardData;
    isRegistered: boolean;
    userRiotLinked: boolean | null;
    onRegister: (id: string) => Promise<void>;
    onLeave: (id: string) => Promise<void>;
    index: number;
};

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
            {/* Game color accent top strip */}
            <div className="h-[2px] w-full shrink-0" style={{ background: `linear-gradient(90deg, ${gameCfg.color}, ${gameCfg.color}50, transparent)` }} />

            {/* Hover glow */}
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                style={{ background: `radial-gradient(ellipse at 50% 0%, ${gameCfg.color}10, transparent 70%)` }}
            />

            <div
                className="flex flex-col flex-1 p-5 border-x border-b border-white/6 rounded-b-2xl backdrop-blur-lg"
                style={{ background: "linear-gradient(160deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)" }}
            >
                {/* Header row */}
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

                {/* Riot notices */}
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

                {/* Description */}
                <p className="text-sm text-white/45 leading-relaxed flex-1 mb-5">{lobby.description}</p>

                {/* Info rows */}
                <div className="space-y-2.5 mb-4">
                    <div className="flex items-center gap-2 text-xs text-white/35">
                        <Calendar size={13} />
                        <span>{lobby.formattedMatchDate}</span>
                    </div>

                    {/* Participant slot bar */}
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

                    {/* Prize */}
                    {hasPrize && (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold" style={{ color: "var(--brand-primary)", background: "rgba(220,20,60,0.1)", border: "1px solid rgba(220,20,60,0.2)" }}>
                            <Trophy size={12} />
                            {lobby.prizePoolLabel}
                        </div>
                    )}
                </div>

                {/* Actions */}
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

export default function Lobbies() {
    const [lobbies, setLobbies] = useState<Lobby[]>([]);
    const [myLobbies, setMyLobbies] = useState<Lobby[]>([]);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [maxParticipants, setMaxParticipants] = useState("");
    const [hasPrize, setHasPrize] = useState(false);
    const [prizePool, setPrizePool] = useState("");
    const [registrationDeadline, setRegistrationDeadline] = useState("");
    const [matchDateTime, setMatchDateTime] = useState("");
    const [selectedGame, setSelectedGame] = useState<GameType>("pokemon_showdown");
    const [selectedLobby, setSelectedLobby] = useState("");
    const [replayUrl, setReplayUrl] = useState("");
    const [message, setMessage] = useState("");
    const [result, setResult] = useState<MatchResultResponse | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatus, setSelectedStatus] = useState<LobbyStatusFilter>("all");
    const [userRiotLinked, setUserRiotLinked] = useState<boolean | null>(null);
    const deferredSearchQuery = useDeferredValue(searchQuery);
    const registrationDeadlineRef = useRef<HTMLInputElement>(null);
    const matchDateTimeRef = useRef<HTMLInputElement>(null);
    const createPanelRef = useRef<HTMLDivElement>(null);

    useEffect(function () {
        getProfile()
            .then(function (res) { setUserRiotLinked(!!res.user.riotPuuid); })
            .catch(function () { setUserRiotLinked(null); });
    }, []);

    const loadData = useCallback(async function (options?: { shouldSync?: boolean }) {
        setMessage("");
        const shouldSync = options?.shouldSync ?? false;
        if (shouldSync) {
            try { await syncParticipantCounts(); } catch (err) { console.error("Error syncing participant counts:", err); }
        }
        const [allLobbiesResult, myLobbiesResult] = await Promise.allSettled([getAllLobbies(), getMyLobbies()]);
        if (allLobbiesResult.status === "fulfilled") {
            setLobbies(Array.isArray(allLobbiesResult.value.lobbies) ? allLobbiesResult.value.lobbies.filter(hasLobbyId) : []);
        } else {
            console.error("Error loading lobbies:", allLobbiesResult.reason);
            setMessage(getErrorMessage(allLobbiesResult.reason));
        }
        if (myLobbiesResult.status === "fulfilled") {
            setMyLobbies(Array.isArray(myLobbiesResult.value.lobbies) ? myLobbiesResult.value.lobbies.filter(hasLobbyId) : []);
        } else {
            setMyLobbies([]);
        }
    }, []);

    useEffect(function () { void loadData({ shouldSync: true }); }, [loadData]);

    const handleRegister = useCallback(async function (id: string) {
        try {
            await registerToLobby(id);
            setMessage("Successfully registered");
            void loadData();
        } catch (err) { setMessage(getErrorMessage(err)); }
    }, [loadData]);

    const handleLeave = useCallback(async function (id: string) {
        try {
            await leaveLobby(id);
            setMessage("Left lobby successfully");
            void loadData();
        } catch (err) { setMessage(getErrorMessage(err)); }
    }, [loadData]);

    async function handleCreate(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        try {
            await createLobby(name, description, parseInt(maxParticipants) || 0, hasPrize ? prizePool : "", registrationDeadline, matchDateTime, selectedGame);
            setMessage("Lobby created successfully");
            setName(""); setDescription(""); setMaxParticipants("");
            setHasPrize(false); setPrizePool(""); setRegistrationDeadline(""); setMatchDateTime("");
            setSelectedGame("pokemon_showdown");
            void loadData({ shouldSync: true });
        } catch (err) { setMessage(getErrorMessage(err)); }
    }

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        try {
            const res = await submitReplay(selectedLobby, replayUrl);
            setResult(res);
            setMessage("Replay submitted successfully");
            setReplayUrl("");
            void loadData();
        } catch (err) { setMessage(getErrorMessage(err)); }
    }

    const filteredLobbies = useMemo(function () {
        const normalizedQuery = deferredSearchQuery.trim().toLowerCase();
        return lobbies
            .filter(hasLobbyId)
            .map(normalizeLobbyForCard)
            .filter(function (lobby) {
                const matchByStatus = selectedStatus === "all" || lobby.status === selectedStatus;
                if (!matchByStatus) return false;
                if (!normalizedQuery) return true;
                return lobby.name.toLowerCase().includes(normalizedQuery) || lobby.description.toLowerCase().includes(normalizedQuery);
            });
    }, [lobbies, deferredSearchQuery, selectedStatus]);

    const myLobbyIds = useMemo(function () {
        return new Set(myLobbies.filter(hasLobbyId).map(function (lobby) { return lobby._id; }));
    }, [myLobbies]);

    const hasActiveFilter = selectedStatus !== "all" || searchQuery.trim().length > 0;

    const inputStyle = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" };
    const inputCls = "w-full h-11 rounded-xl px-3 text-sm text-white outline-none transition-all focus:border-[var(--brand-primary)]/40 placeholder:text-white/20";

    return (
        <div className="relative bg-[var(--neutral-bg)] text-white min-h-[calc(100vh-64px)]">
            <LobbiesBackground />

            <div className="relative z-10 pointer-events-auto">
                {/* ── Hero header ── */}
                <div className="max-w-[1512px] mx-auto px-6 md:px-20 pt-14 pb-10">
                    <motion.div
                        initial={{ opacity: 0, y: 28 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <p className="text-[10px] font-bold tracking-[0.35em] uppercase text-white/25 mb-4">Competitive Arena</p>
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                            <div>
                                <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none mb-3">
                                    TOURNAMENTS
                                </h1>
                                <p className="text-white/40 text-lg">
                                    Browse, register, and compete in the most intense G-RANK lobbies.
                                </p>
                            </div>
                            <div className="flex items-center gap-6 shrink-0 mb-1">
                                <div className="text-right">
                                    <p className="text-3xl font-black text-[var(--brand-primary)]">{lobbies.filter(l => normalizeStatus(l.status) === "open").length}</p>
                                    <p className="text-[10px] text-white/25 tracking-widest uppercase">Open</p>
                                </div>
                                <div className="w-px h-10 bg-white/8" />
                                <div className="text-right">
                                    <p className="text-3xl font-black text-white">{lobbies.length}</p>
                                    <p className="text-[10px] text-white/25 tracking-widest uppercase">Total</p>
                                </div>
                                <Button
                                    className="px-6 py-3 font-bold tracking-wide"
                                    onClick={function () { createPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }}
                                >
                                    <Plus size={16} />
                                    Create
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <section className="max-w-[1512px] mx-auto px-6 md:px-20 pb-16 space-y-6">
                    {/* ── Search + filters ── */}
                    <motion.div
                        className="space-y-3"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <div className="flex flex-col lg:flex-row gap-3">
                            <div className="flex-1 relative">
                                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
                                <input
                                    className="w-full h-12 rounded-xl pl-11 pr-4 text-sm text-white outline-none transition-all"
                                    style={inputStyle}
                                    placeholder="Search tournaments..."
                                    value={searchQuery}
                                    onChange={function (event) { setSearchQuery(event.target.value); }}
                                />
                            </div>
                            <div className="flex items-center gap-2 h-12 px-4 rounded-xl" style={inputStyle}>
                                <Filter size={14} className="text-white/25" />
                                <span className="text-sm text-white/30">Filters</span>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {FILTERS.map(function (filterItem) {
                                const active = selectedStatus === filterItem.value;
                                return (
                                    <button
                                        key={filterItem.value}
                                        onClick={function () { setSelectedStatus(filterItem.value); }}
                                        className="px-4 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all duration-200"
                                        style={active
                                            ? { background: "rgba(220,20,60,0.15)", border: "1px solid rgba(220,20,60,0.4)", color: "var(--brand-primary)" }
                                            : { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.35)" }
                                        }
                                    >
                                        {filterItem.label}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* ── Cards grid ── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {filteredLobbies.map(function (lobby, i) {
                            return (
                                <LobbyCard
                                    key={lobby._id}
                                    lobby={lobby}
                                    isRegistered={myLobbyIds.has(lobby._id)}
                                    userRiotLinked={userRiotLinked}
                                    onRegister={handleRegister}
                                    onLeave={handleLeave}
                                    index={i}
                                />
                            );
                        })}
                    </div>

                    {filteredLobbies.length === 0 && (
                        <motion.div
                            className="rounded-2xl px-6 py-16 text-center"
                            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                                <Trophy size={28} className="text-white/15" />
                            </div>
                            <p className="text-white/30 mb-4">No tournaments match your filters.</p>
                            {hasActiveFilter && (
                                <button
                                    className="text-sm font-bold text-[var(--brand-primary)] hover:text-white transition-colors"
                                    onClick={function () { setSearchQuery(""); setSelectedStatus("all"); }}
                                >
                                    Clear filters
                                </button>
                            )}
                        </motion.div>
                    )}

                    {message && (
                        <motion.div
                            className="rounded-xl px-4 py-3 text-sm font-medium"
                            style={{ border: "1px solid rgba(220,20,60,0.3)", background: "rgba(220,20,60,0.08)", color: "var(--brand-primary)" }}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                        >
                            {message}
                        </motion.div>
                    )}
                </section>

                {/* ── Create + Submit panels ── */}
                <section className="max-w-[1512px] mx-auto px-6 md:px-20 pb-20">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                        {/* Create lobby */}
                        <motion.div
                            ref={createPanelRef}
                            className="relative rounded-2xl overflow-hidden"
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ amount: 0.15 }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(220,20,60,0.5), transparent)" }} />
                            <div className="absolute inset-0 border border-white/5 backdrop-blur-xl" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)" }} />

                            <div className="relative z-10 p-7">
                                <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/25 mb-1">New Tournament</p>
                                <h2 className="text-2xl font-black mb-1">Create Lobby</h2>
                                <p className="text-sm text-white/35 mb-6">Set up a new competitive lobby in seconds.</p>

                                <form onSubmit={handleCreate} className="space-y-4">
                                    <div>
                                        <p className="text-[10px] font-bold text-white/30 mb-2 tracking-widest uppercase">Game</p>
                                        <div className="grid grid-cols-3 gap-2">
                                            {(Object.entries(GAME_CONFIG) as [GameType, GameConfig][]).map(function ([key, cfg]) {
                                                const Icon = cfg.Icon;
                                                const isActive = selectedGame === key;
                                                return (
                                                    <button
                                                        key={key}
                                                        type="button"
                                                        onClick={function () { setSelectedGame(key); }}
                                                        className="flex flex-col items-center gap-1.5 rounded-xl py-3 px-2 text-xs font-bold transition-all duration-200"
                                                        style={isActive
                                                            ? { borderColor: cfg.color + "50", backgroundColor: cfg.color + "15", color: cfg.color, border: `1px solid ${cfg.color}50` }
                                                            : { border: "1px solid rgba(255,255,255,0.07)", backgroundColor: "transparent", color: "rgba(255,255,255,0.3)" }
                                                        }
                                                    >
                                                        <Icon size={18} />
                                                        {cfg.shortLabel}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <input type="text" placeholder="Lobby name" value={name} onChange={function (e) { setName(e.target.value); }} className={inputCls} style={inputStyle} required />
                                    <input type="text" placeholder="Description" value={description} onChange={function (e) { setDescription(e.target.value); }} className={inputCls} style={inputStyle} required />

                                    <div className="relative">
                                        <Users size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
                                        <input type="number" placeholder="Max participants" min={2} value={maxParticipants} onChange={function (e) { setMaxParticipants(e.target.value); }} className={inputCls + " pl-9"} style={inputStyle} required />
                                    </div>

                                    <div className="flex items-center justify-between h-11 rounded-xl px-4" style={inputStyle}>
                                        <div className="flex items-center gap-2 text-sm text-white/40">
                                            <Trophy size={15} />
                                            <span>Has prize?</span>
                                        </div>
                                        <button
                                            type="button"
                                            role="switch"
                                            aria-checked={hasPrize}
                                            onClick={function () { setHasPrize(!hasPrize); }}
                                            className={"relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 " + (hasPrize ? "bg-[var(--brand-primary)]" : "bg-white/10")}
                                        >
                                            <span className={"pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md ring-0 transition-transform duration-300 " + (hasPrize ? "translate-x-5" : "translate-x-0")} />
                                        </button>
                                    </div>

                                    {hasPrize && (
                                        <div className="relative">
                                            <Trophy size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--brand-primary)] pointer-events-none" />
                                            <input type="text" placeholder="Prize (e.g. $500, Steam gift card...)" value={prizePool} onChange={function (e) { setPrizePool(e.target.value); }} className={inputCls + " pl-9"} style={{ ...inputStyle, borderColor: "rgba(220,20,60,0.25)" }} required />
                                        </div>
                                    )}

                                    <label className="flex items-center gap-3 text-sm text-white/35">
                                        <Calendar size={16} className="cursor-pointer shrink-0" onClick={function () { registrationDeadlineRef.current?.showPicker(); }} />
                                        <span className="w-36 shrink-0">Registration deadline</span>
                                        <input ref={registrationDeadlineRef} type="datetime-local" value={registrationDeadline} onChange={function (e) { setRegistrationDeadline(e.target.value); }} className="flex-1 h-10 rounded-xl px-3 text-sm text-white outline-none" style={inputStyle} required />
                                    </label>

                                    <label className="flex items-center gap-3 text-sm text-white/35">
                                        <Calendar size={16} className="cursor-pointer shrink-0" onClick={function () { matchDateTimeRef.current?.showPicker(); }} />
                                        <span className="w-36 shrink-0">Match date</span>
                                        <input ref={matchDateTimeRef} type="datetime-local" value={matchDateTime} onChange={function (e) { setMatchDateTime(e.target.value); }} className="flex-1 h-10 rounded-xl px-3 text-sm text-white outline-none" style={inputStyle} required />
                                    </label>

                                    <Button className="w-full py-3 font-bold tracking-wide">Create lobby</Button>
                                </form>
                            </div>
                        </motion.div>

                        {/* Submit replay */}
                        <motion.div
                            className="relative rounded-2xl overflow-hidden"
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ amount: 0.15 }}
                            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(155,48,255,0.4), transparent)" }} />
                            <div className="absolute inset-0 border border-white/5 backdrop-blur-xl" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)" }} />

                            <div className="relative z-10 p-7">
                                <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/25 mb-1">Match Results</p>
                                <h2 className="text-2xl font-black mb-1">Submit Replay</h2>
                                <p className="text-sm text-white/35 mb-6">Submit the replay link to update MMR automatically.</p>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <select value={selectedLobby} onChange={function (e) { setSelectedLobby(e.target.value); }} className={inputCls} style={inputStyle} required>
                                        <option value="">Select a lobby</option>
                                        {myLobbies.map(function (lobby) {
                                            return <option key={lobby._id} value={lobby._id}>{lobby.name}</option>;
                                        })}
                                    </select>
                                    <input type="url" placeholder="https://..." value={replayUrl} onChange={function (e) { setReplayUrl(e.target.value); }} className={inputCls} style={inputStyle} required />
                                    <Button variant="outline" className="w-full py-3 font-bold tracking-wide">
                                        <CheckCircle2 size={16} />
                                        Submit replay
                                    </Button>
                                </form>

                                {result && (
                                    <div className="mt-6 rounded-xl p-5 space-y-2 text-sm" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                                        <h3 className="font-bold text-white/60 text-xs tracking-widest uppercase mb-3">Processed Result</h3>
                                        <p className="text-green-400">
                                            Winner: {result.result?.winner?.username} ({result.result?.winner?.mmrChange?.after} MMR, +{result.result?.winner?.mmrChange?.change})
                                        </p>
                                        <p style={{ color: "var(--brand-primary)" }}>
                                            Loser: {result.result?.loser?.username} ({result.result?.loser?.mmrChange?.after} MMR, {result.result?.loser?.mmrChange?.change})
                                        </p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </section>
            </div>
        </div>
    );
}
