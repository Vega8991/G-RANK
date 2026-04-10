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

const STATUS_CLASS: Record<UiLobbyStatus, string> = {
    open: "bg-[var(--brand-primary)]/20 text-[var(--brand-primary)] border-[var(--brand-primary)]/40",
    pending: "bg-[#1F2937]/50 text-[#D1D5DB] border-[#374151]",
    in_progress: "bg-[#2563EB]/25 text-[#7FB3FF] border-[#2563EB]/40",
    completed: "bg-[var(--neutral-border)]/25 text-[var(--neutral-text-muted)] border-[var(--neutral-border)]/40",
    cancelled: "bg-[#7F1D1D]/30 text-[#FCA5A5] border-[#B91C1C]/40",
    unknown: "bg-[#1F2937]/45 text-[#E5E7EB] border-[#374151]"
};

const FILTERS: Array<{ value: LobbyStatusFilter; label: string }> = [
    { value: "all", label: "All" },
    { value: "open", label: "Registering" },
    { value: "pending", label: "Pending" },
    { value: "in_progress", label: "Live" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" }
];

function getErrorMessage(err: unknown): string {
    const axiosErr = err as AxiosError<{ message?: string }>;
    return axiosErr.response?.data?.message || "Error";
}

function formatDate(value: string): string {
    if (!value) return "Date pending";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Date pending";

    return date.toLocaleString("es-ES", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
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
        if (isRegistered) {
            return { label: "Already registered", variant: "outline", disabled: true };
        }
        if (isFull) {
            return { label: "Slots full", variant: "outline", disabled: true };
        }
        return { label: "Register now", variant: "primary", disabled: false };
    }

    if (status === "pending") {
        return { label: "Waiting to start", variant: "outline", disabled: true };
    }

    if (status === "in_progress") {
        return { label: "In progress", variant: "outline", disabled: true };
    }

    if (status === "completed") {
        return { label: "View results", variant: "outline", disabled: true };
    }

    if (status === "cancelled") {
        return { label: "Cancelled", variant: "outline", disabled: true };
    }

    return { label: "Coming soon", variant: "outline", disabled: true };
}

const LobbiesBackground = memo(function LobbiesBackground() {
    return (
        <div className="fixed inset-0 z-0 w-screen h-screen overflow-hidden">
            <Silk
                speed={3}
                scale={1.2}
                color="#7a0e1e"
                noiseIntensity={1.5}
                rotation={0.3}
            />
            <div className="pointer-events-none absolute inset-0 bg-black/25" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(220,20,60,0.55),transparent_45%),radial-gradient(circle_at_80%_15%,rgba(220,20,60,0.35),transparent_45%),radial-gradient(circle_at_50%_60%,rgba(180,10,40,0.25),transparent_55%)]" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-[var(--neutral-bg)]" />
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
};

const LobbyCard = memo(function LobbyCard({ lobby, isRegistered, userRiotLinked, onRegister, onLeave }: LobbyCardProps) {
    const isFull = lobby.maxParticipants > 0 && lobby.currentParticipants >= lobby.maxParticipants;
    const action = getCardAction(lobby.status, isRegistered, isFull);
    const gameCfg = GAME_CONFIG[lobby.game];
    const GameIcon = gameCfg.Icon;
    const needsRiot = gameCfg.requiresRiot;
    const riotMissing = needsRiot && userRiotLinked === false;
    const riotOk = needsRiot && userRiotLinked === true;

    return (
        <article
            className="group rounded-2xl border border-[var(--neutral-border)]/50 bg-[var(--neutral-surface)]/35 backdrop-blur-lg p-5 transition-all duration-500 hover:-translate-y-1.5 hover:border-[var(--brand-primary)]/40 hover:shadow-2xl hover:shadow-[var(--brand-primary)]/10"
        >
            <div className="flex items-start justify-between gap-3 mb-1">
                <h3 className="text-2xl font-bold leading-tight">{lobby.name}</h3>
                <div className="flex items-center gap-2 shrink-0">
                    <span
                        className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border"
                        style={{
                            color: gameCfg.color,
                            backgroundColor: gameCfg.bg,
                            borderColor: gameCfg.color + "50"
                        }}
                    >
                        <GameIcon size={11} />
                        {gameCfg.shortLabel}
                    </span>
                    <span
                        className={
                            "capitalize text-[10px] font-bold px-2.5 py-1 rounded-full border " +
                            STATUS_CLASS[lobby.status]
                        }
                    >
                        {STATUS_LABEL[lobby.status]}
                    </span>
                </div>
            </div>
            <p className="text-xs text-[var(--neutral-text-muted)] mb-3">
                by {lobby.createdByName}
            </p>

            {riotMissing && (
                <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/8 px-3 py-2.5 mb-4">
                    <AlertCircle size={14} className="text-amber-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-300 leading-relaxed">
                        This tournament requires a <span className="font-semibold">linked Riot account</span> to submit results.{" "}
                        <a href="/dashboard" className="underline underline-offset-2 hover:text-amber-100 transition-colors">
                            Link in your profile →
                        </a>
                    </p>
                </div>
            )}

            {riotOk && (
                <div className="flex items-center gap-2 rounded-lg border border-green-500/25 bg-green-500/8 px-3 py-2 mb-4">
                    <CheckCircle size={13} className="text-green-400 shrink-0" />
                    <p className="text-xs text-green-300">
                        Riot account linked — ready to compete
                    </p>
                </div>
            )}

            {needsRiot && userRiotLinked === null && (
                <div className="flex items-center gap-2 rounded-lg border border-[var(--neutral-border)]/30 bg-[var(--neutral-surface)]/30 px-3 py-2 mb-4">
                    <AlertCircle size={13} className="text-[var(--neutral-text-muted)] shrink-0" />
                    <p className="text-xs text-[var(--neutral-text-muted)]">
                        Requires a linked Riot account to submit match results
                    </p>
                </div>
            )}

            <p className="text-sm text-[var(--neutral-text-secondary)] min-h-12 mb-5">
                {lobby.description}
            </p>

            <div className="space-y-3 mb-5">
                <div className="flex items-center gap-2 text-sm text-[var(--neutral-text-secondary)]">
                    <Calendar size={14} />
                    <span>{lobby.formattedMatchDate}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[var(--neutral-text-secondary)]">
                    <Users size={14} />
                    <span>
                        {lobby.currentParticipants}/{lobby.maxParticipants} participants
                    </span>
                </div>
                <div className={"flex items-center gap-2 text-sm font-semibold " + (lobby.prizePoolLabel !== "No prize" ? "text-[var(--brand-primary)]" : "text-[var(--neutral-text-muted)]")}>
                    <Trophy size={14} />
                    <span>{lobby.prizePoolLabel}</span>
                </div>
            </div>

            <div className="flex gap-2">
                <Button
                    variant={action.variant}
                    className={"py-2.5 " + (isRegistered && lobby.status === "open" ? "flex-1" : "w-full")}
                    disabled={action.disabled}
                    onClick={function () {
                        if (action.label === "Register now") {
                            onRegister(lobby._id);
                        }
                    }}
                >
                    {action.label}
                </Button>
                {isRegistered && lobby.status === "open" && (
                    <Button
                        variant="outline"
                        className="py-2.5 px-4 border-red-500/40 text-red-400 hover:bg-red-500/10 hover:border-red-500/60"
                        onClick={function () {
                            onLeave(lobby._id);
                        }}
                    >
                        <LogOut size={16} />
                        Leave
                    </Button>
                )}
            </div>
        </article>
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
            .then(function (res) {
                setUserRiotLinked(!!res.user.riotPuuid);
            })
            .catch(function () {
                setUserRiotLinked(null);
            });
    }, []);

    const loadData = useCallback(async function (options?: { shouldSync?: boolean }) {
        setMessage("");
        const shouldSync = options?.shouldSync ?? false;

        if (shouldSync) {
            try {
                await syncParticipantCounts();
            } catch (err) {
                console.error("Error syncing participant counts:", err);
            }
        }

        const [allLobbiesResult, myLobbiesResult] = await Promise.allSettled([
            getAllLobbies(),
            getMyLobbies()
        ]);

        if (allLobbiesResult.status === "fulfilled") {
            const safeLobbies = Array.isArray(allLobbiesResult.value.lobbies)
                ? allLobbiesResult.value.lobbies.filter(hasLobbyId)
                : [];
            setLobbies(safeLobbies);
        } else {
            console.error("Error loading lobbies:", allLobbiesResult.reason);
            setMessage(getErrorMessage(allLobbiesResult.reason));
        }

        if (myLobbiesResult.status === "fulfilled") {
            const safeMyLobbies = Array.isArray(myLobbiesResult.value.lobbies)
                ? myLobbiesResult.value.lobbies.filter(hasLobbyId)
                : [];
            setMyLobbies(safeMyLobbies);
        } else {
            setMyLobbies([]);
        }
    }, []);

    useEffect(function () {
        void loadData({ shouldSync: true });
    }, [loadData]);

    const handleRegister = useCallback(async function (id: string) {
        try {
            await registerToLobby(id);
            setMessage("Successfully registered");
            void loadData();
        } catch (err) {
            setMessage(getErrorMessage(err));
        }
    }, [loadData]);

    const handleLeave = useCallback(async function (id: string) {
        try {
            await leaveLobby(id);
            setMessage("Left lobby successfully");
            void loadData();
        } catch (err) {
            setMessage(getErrorMessage(err));
        }
    }, [loadData]);

    async function handleCreate(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        try {
            await createLobby(
                name,
                description,
                parseInt(maxParticipants) || 0,
                hasPrize ? prizePool : "",
                registrationDeadline,
                matchDateTime,
                selectedGame
            );
            setMessage("Lobby created successfully");
            setName("");
            setDescription("");
            setMaxParticipants("");
            setHasPrize(false);
            setPrizePool("");
            setRegistrationDeadline("");
            setMatchDateTime("");
            setSelectedGame("pokemon_showdown");
            void loadData({ shouldSync: true });
        } catch (err) {
            setMessage(getErrorMessage(err));
        }
    }

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        try {
            const res = await submitReplay(selectedLobby, replayUrl);
            setResult(res);
            setMessage("Replay submitted successfully");
            setReplayUrl("");
            void loadData();
        } catch (err) {
            setMessage(getErrorMessage(err));
        }
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
                return (
                    lobby.name.toLowerCase().includes(normalizedQuery) ||
                    lobby.description.toLowerCase().includes(normalizedQuery)
                );
            });
    }, [lobbies, deferredSearchQuery, selectedStatus]);

    const myLobbyIds = useMemo(function () {
        return new Set(
            myLobbies
                .filter(hasLobbyId)
                .map(function (lobby) {
                    return lobby._id;
                })
        );
    }, [myLobbies]);

    const hasActiveFilter = selectedStatus !== "all" || searchQuery.trim().length > 0;

    return (
        <div className="relative bg-[var(--neutral-bg)] text-white min-h-[calc(100vh-64px)]">
            <LobbiesBackground />

            <div className="relative z-10 pointer-events-auto">
                <section className="max-w-[1512px] mx-auto px-6 md:px-20 pt-12 pb-16 space-y-8">
                    <motion.div
                        className="flex flex-col md:flex-row md:items-center md:justify-between gap-6"
                        initial={{ opacity: 0, y: 28 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <div>
                            <h1 className="text-4xl md:text-5xl font-extrabold mb-2">Lobbies</h1>
                            <p className="text-[var(--neutral-text-secondary)] text-lg">
                                Browse, register, and compete in the most intense G-RANK lobbies.
                            </p>
                        </div>

                        <Button
                            className="px-6 py-3 self-start md:self-auto"
                            onClick={function () {
                                createPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                            }}
                        >
                            <Plus size={18} />
                            Create Lobby
                        </Button>
                    </motion.div>

                    <motion.div
                        className="flex flex-col lg:flex-row gap-4"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <div className="flex-1 relative">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--neutral-text-muted)]" />
                            <input
                                className="w-full h-12 rounded-xl bg-[var(--neutral-surface)]/50 border border-[var(--neutral-border)]/50 pl-11 pr-4 text-sm outline-none transition-all duration-300 focus:border-[var(--brand-primary)]/50 focus:ring-2 focus:ring-[var(--brand-primary)]/20"
                                placeholder="Search lobbies..."
                                value={searchQuery}
                                onChange={function (event) {
                                    setSearchQuery(event.target.value);
                                }}
                            />
                        </div>
                        <div className="flex items-center gap-2 rounded-xl border border-[var(--neutral-border)]/50 bg-[var(--neutral-surface)]/40 px-4">
                            <Filter size={16} className="text-[var(--neutral-text-muted)]" />
                            <span className="text-sm text-[var(--neutral-text-secondary)]">Filters</span>
                        </div>
                    </motion.div>

                    <motion.div
                        className="flex flex-wrap gap-2"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                    >
                        {FILTERS.map(function (filterItem) {
                            const active = selectedStatus === filterItem.value;
                            return (
                                <button
                                    key={filterItem.value}
                                    onClick={function () {
                                        setSelectedStatus(filterItem.value);
                                    }}
                                    className={
                                        "px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-300 " +
                                        (active
                                            ? "bg-[var(--brand-primary)]/20 border-[var(--brand-primary)]/50 text-[var(--brand-primary)]"
                                            : "bg-[var(--neutral-surface)]/40 border-[var(--neutral-border)]/40 text-[var(--neutral-text-secondary)] hover:border-[var(--brand-primary)]/40 hover:text-white")
                                    }
                                >
                                    {filterItem.label}
                                </button>
                            );
                        })}
                    </motion.div>

                    <div
                        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                    >
                        {filteredLobbies.map(function (lobby) {
                            return (
                                <LobbyCard
                                    key={lobby._id}
                                    lobby={lobby}
                                    isRegistered={myLobbyIds.has(lobby._id)}
                                    userRiotLinked={userRiotLinked}
                                    onRegister={handleRegister}
                                    onLeave={handleLeave}
                                />
                            );
                        })}
                    </div>

                    {filteredLobbies.length === 0 && (
                        <div className="rounded-xl border border-[var(--neutral-border)]/40 bg-[var(--neutral-surface)]/55 px-6 py-8 text-center text-[var(--neutral-text-secondary)]">
                            <p>No lobbies match your current filters.</p>
                            {hasActiveFilter && (
                                <button
                                    className="mt-3 text-sm font-semibold text-[var(--brand-primary)] hover:text-white transition-colors"
                                    onClick={function () {
                                        setSearchQuery("");
                                        setSelectedStatus("all");
                                    }}
                                >
                                    Clear filters
                                </button>
                            )}
                        </div>
                    )}

                    {message && (
                        <motion.div
                            className="rounded-xl border border-[var(--brand-primary)]/40 bg-[var(--brand-primary)]/10 px-4 py-3 text-sm text-[var(--brand-primary)]"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                        >
                            {message}
                        </motion.div>
                    )}
                </section>

                <section className="max-w-[1512px] mx-auto px-6 md:px-20 pb-16">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        <motion.div
                            ref={createPanelRef}
                            className="rounded-2xl border border-[var(--neutral-border)]/50 bg-[var(--neutral-surface)]/40 backdrop-blur-xl p-6"
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ amount: 0.2 }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <h2 className="text-2xl font-bold mb-1">Create lobby</h2>
                            <p className="text-sm text-[var(--neutral-text-secondary)] mb-6">
                                Set up a new competitive lobby in seconds.
                            </p>

                            <form onSubmit={handleCreate} className="space-y-4">
                                <div>
                                    <p className="text-xs font-semibold text-[var(--neutral-text-muted)] mb-2 tracking-wide uppercase">Game</p>
                                    <div className="grid grid-cols-3 gap-2">
                                        {(Object.entries(GAME_CONFIG) as [GameType, GameConfig][]).map(function ([key, cfg]) {
                                            const Icon = cfg.Icon;
                                            const isActive = selectedGame === key;
                                            return (
                                                <button
                                                    key={key}
                                                    type="button"
                                                    onClick={function () { setSelectedGame(key); }}
                                                    className="flex flex-col items-center gap-1.5 rounded-xl border py-3 px-2 text-xs font-semibold transition-all duration-200"
                                                    style={isActive ? {
                                                        borderColor: cfg.color + "70",
                                                        backgroundColor: cfg.bg,
                                                        color: cfg.color
                                                    } : {
                                                        borderColor: "var(--neutral-border)",
                                                        backgroundColor: "transparent",
                                                        color: "var(--neutral-text-muted)"
                                                    }}
                                                >
                                                    <Icon size={18} />
                                                    {cfg.shortLabel}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Lobby name"
                                    value={name}
                                    onChange={function (event) {
                                        setName(event.target.value);
                                    }}
                                    className="w-full h-11 rounded-lg bg-[var(--neutral-bg)]/50 border border-[var(--neutral-border)]/50 px-3 text-sm outline-none focus:border-[var(--brand-primary)]/50"
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Description"
                                    value={description}
                                    onChange={function (event) {
                                        setDescription(event.target.value);
                                    }}
                                    className="w-full h-11 rounded-lg bg-[var(--neutral-bg)]/50 border border-[var(--neutral-border)]/50 px-3 text-sm outline-none focus:border-[var(--brand-primary)]/50"
                                    required
                                />

                                <div className="relative">
                                    <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--neutral-text-muted)] pointer-events-none" />
                                    <input
                                        type="number"
                                        placeholder="Max participants"
                                        min={2}
                                        value={maxParticipants}
                                        onChange={function (event) {
                                            setMaxParticipants(event.target.value);
                                        }}
                                        className="w-full h-11 rounded-lg bg-[var(--neutral-bg)]/50 border border-[var(--neutral-border)]/50 pl-9 pr-3 text-sm outline-none focus:border-[var(--brand-primary)]/50"
                                        required
                                    />
                                </div>

                                <div className="flex items-center justify-between h-11 rounded-lg bg-[var(--neutral-bg)]/50 border border-[var(--neutral-border)]/50 px-3">
                                    <div className="flex items-center gap-2 text-sm text-[var(--neutral-text-secondary)]">
                                        <Trophy size={16} />
                                        <span>Has prize?</span>
                                    </div>
                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={hasPrize}
                                        onClick={function () { setHasPrize(!hasPrize); }}
                                        className={
                                            "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]/50 " +
                                            (hasPrize ? "bg-[var(--brand-primary)]" : "bg-[var(--neutral-border)]")
                                        }
                                    >
                                        <span
                                            className={
                                                "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md ring-0 transition-transform duration-300 " +
                                                (hasPrize ? "translate-x-5" : "translate-x-0")
                                            }
                                        />
                                    </button>
                                </div>

                                {hasPrize && (
                                    <div className="relative">
                                        <Trophy size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--brand-primary)] pointer-events-none" />
                                        <input
                                            type="text"
                                            placeholder="Prize (e.g. $500, Steam gift card...)"
                                            value={prizePool}
                                            onChange={function (event) {
                                                setPrizePool(event.target.value);
                                            }}
                                            className="w-full h-11 rounded-lg bg-[var(--neutral-bg)]/50 border border-[var(--brand-primary)]/30 pl-9 pr-3 text-sm outline-none focus:border-[var(--brand-primary)]/60"
                                            required
                                        />
                                    </div>
                                )}

                                <label className="flex items-center gap-3 text-sm text-[var(--neutral-text-secondary)]">
                                    <Calendar
                                        size={17}
                                        className="cursor-pointer"
                                        onClick={function () {
                                            registrationDeadlineRef.current?.showPicker();
                                        }}
                                    />
                                    <span className="w-40">Registration deadline</span>
                                    <input
                                        ref={registrationDeadlineRef}
                                        type="datetime-local"
                                        value={registrationDeadline}
                                        onChange={function (event) {
                                            setRegistrationDeadline(event.target.value);
                                        }}
                                        className="flex-1 h-10 rounded-lg bg-[var(--neutral-bg)]/50 border border-[var(--neutral-border)]/50 px-3 text-sm outline-none focus:border-[var(--brand-primary)]/50"
                                        required
                                    />
                                </label>

                                <label className="flex items-center gap-3 text-sm text-[var(--neutral-text-secondary)]">
                                    <Calendar
                                        size={17}
                                        className="cursor-pointer"
                                        onClick={function () {
                                            matchDateTimeRef.current?.showPicker();
                                        }}
                                    />
                                    <span className="w-40">Match date</span>
                                    <input
                                        ref={matchDateTimeRef}
                                        type="datetime-local"
                                        value={matchDateTime}
                                        onChange={function (event) {
                                            setMatchDateTime(event.target.value);
                                        }}
                                        className="flex-1 h-10 rounded-lg bg-[var(--neutral-bg)]/50 border border-[var(--neutral-border)]/50 px-3 text-sm outline-none focus:border-[var(--brand-primary)]/50"
                                        required
                                    />
                                </label>

                                <Button className="w-full py-2.5">Create lobby</Button>
                            </form>
                        </motion.div>

                        <motion.div
                            className="rounded-2xl border border-[var(--neutral-border)]/50 bg-[var(--neutral-surface)]/40 backdrop-blur-xl p-6"
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ amount: 0.2 }}
                            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <h2 className="text-2xl font-bold mb-1">Submit replay</h2>
                            <p className="text-sm text-[var(--neutral-text-secondary)] mb-6">
                                Submit the replay link to update MMR automatically.
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <select
                                    value={selectedLobby}
                                    onChange={function (event) {
                                        setSelectedLobby(event.target.value);
                                    }}
                                    className="w-full h-11 rounded-lg bg-[var(--neutral-bg)]/50 border border-[var(--neutral-border)]/50 px-3 text-sm outline-none focus:border-[var(--brand-primary)]/50"
                                    required
                                >
                                    <option value="">Select a lobby</option>
                                    {myLobbies.map(function (lobby) {
                                        return (
                                            <option key={lobby._id} value={lobby._id}>
                                                {lobby.name}
                                            </option>
                                        );
                                    })}
                                </select>
                                <input
                                    type="url"
                                    placeholder="https://..."
                                    value={replayUrl}
                                    onChange={function (event) {
                                        setReplayUrl(event.target.value);
                                    }}
                                    className="w-full h-11 rounded-lg bg-[var(--neutral-bg)]/50 border border-[var(--neutral-border)]/50 px-3 text-sm outline-none focus:border-[var(--brand-primary)]/50"
                                    required
                                />
                                <Button variant="outline" className="w-full py-2.5">
                                    <CheckCircle2 size={16} />
                                    Submit replay
                                </Button>
                            </form>

                            {result && (
                                <div className="mt-6 rounded-xl border border-[var(--neutral-border)]/40 bg-[var(--neutral-bg)]/50 p-4 space-y-2 text-sm">
                                    <h3 className="font-semibold">Processed result</h3>
                                    <p className="text-[var(--status-success)]">
                                        Winner: {result.result?.winner?.username} ({result.result?.winner?.mmrChange?.after} MMR, +
                                        {result.result?.winner?.mmrChange?.change})
                                    </p>
                                    <p className="text-[var(--brand-primary)]">
                                        Loser: {result.result?.loser?.username} ({result.result?.loser?.mmrChange?.after} MMR,{" "}
                                        {result.result?.loser?.mmrChange?.change})
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </section>
            </div>
        </div>
    );
}
