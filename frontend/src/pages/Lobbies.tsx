import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { AxiosError } from "axios";
import { motion } from "framer-motion";
import { Calendar, Filter, Search, Trophy, Users, CheckCircle2, Plus } from "lucide-react";
import Button from "../components/common/Button";
import Antigravity from "../components/ui/Antigravity";
import { createLobby, getAllLobbies, getMyLobbies, registerToLobby, syncParticipantCounts } from "../services/lobbyService";
import { submitReplay } from "../services/matchService";
import type { MatchResultResponse, Lobby } from "../types";

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

function estimatePrize(maxParticipants: number): string {
    const base = Math.max(1500, maxParticipants * 300);
    return "$" + base.toLocaleString("en-US");
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

function LobbiesBackground() {
    return (
        <div className="fixed inset-0 z-0 w-screen h-screen overflow-hidden">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(220,20,60,0.24),transparent_38%),radial-gradient(circle_at_78%_20%,rgba(220,20,60,0.12),transparent_32%),radial-gradient(circle_at_50%_100%,rgba(220,20,60,0.22),transparent_48%)]" />
            <div className="absolute left-1/2 top-[-260px] -translate-x-1/2 opacity-45 pointer-events-auto">
                <div style={{ width: "1080px", height: "1080px", position: "relative" }}>
                    <Antigravity
                        count={130}
                        magnetRadius={19}
                        ringRadius={8}
                        waveSpeed={0.3}
                        waveAmplitude={1.5}
                        particleSize={1}
                        lerpSpeed={0.25}
                        color="#db1414"
                        autoAnimate={true}
                        particleVariance={0.6}
                        rotationSpeed={0}
                        depthFactor={0.3}
                        pulseSpeed={3}
                        particleShape="capsule"
                        fieldStrength={5}
                    />
                </div>
            </div>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/25 via-black/55 to-[var(--neutral-bg)]" />
        </div>
    );
}

export default function Lobbies() {
    const [lobbies, setLobbies] = useState<Lobby[]>([]);
    const [myLobbies, setMyLobbies] = useState<Lobby[]>([]);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [registrationDeadline, setRegistrationDeadline] = useState("");
    const [matchDateTime, setMatchDateTime] = useState("");
    const [selectedLobby, setSelectedLobby] = useState("");
    const [replayUrl, setReplayUrl] = useState("");
    const [message, setMessage] = useState("");
    const [result, setResult] = useState<MatchResultResponse | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatus, setSelectedStatus] = useState<LobbyStatusFilter>("all");
    const registrationDeadlineRef = useRef<HTMLInputElement>(null);
    const matchDateTimeRef = useRef<HTMLInputElement>(null);
    const createPanelRef = useRef<HTMLDivElement>(null);

    useEffect(function () {
        void loadData();
    }, []);

    async function loadData() {
        setMessage("");
        setLobbies([]);

        try {
            await syncParticipantCounts();
        } catch (err) {
            console.error("Error syncing participant counts:", err);
        }

        try {
            const allLobbiesResponse = await getAllLobbies();
            const safeLobbies = Array.isArray(allLobbiesResponse.lobbies)
                ? allLobbiesResponse.lobbies.filter(hasLobbyId)
                : [];
            setLobbies(safeLobbies);
        } catch (err) {
            console.error("Error loading lobbies:", err);
            setMessage(getErrorMessage(err));
        }

        try {
            const myResponse = await getMyLobbies();
            const safeMyLobbies = Array.isArray(myResponse.lobbies)
                ? myResponse.lobbies.filter(hasLobbyId)
                : [];
            setMyLobbies(safeMyLobbies);
        } catch (err) {
            setMyLobbies([]);
        }
    }

    async function handleCreate(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        try {
            await createLobby(name, description, registrationDeadline, matchDateTime);
            setMessage("Lobby created successfully");
            setName("");
            setDescription("");
            setRegistrationDeadline("");
            setMatchDateTime("");
            void loadData();
        } catch (err) {
            setMessage(getErrorMessage(err));
        }
    }

    async function handleRegister(id: string) {
        try {
            await registerToLobby(id);
            setMessage("Successfully registered");
            void loadData();
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
        const normalizedQuery = searchQuery.trim().toLowerCase();

        return lobbies.filter(function (lobby) {
            if (!hasLobbyId(lobby)) return false;
            const normalizedStatus = normalizeStatus(lobby.status);
            const matchByStatus = selectedStatus === "all" || normalizedStatus === selectedStatus;
            if (!matchByStatus) return false;

            if (!normalizedQuery) return true;
            const safeName = String(lobby.name || "").toLowerCase();
            const safeDescription = String(lobby.description || "").toLowerCase();
            return (
                safeName.includes(normalizedQuery) ||
                safeDescription.includes(normalizedQuery)
            );
        });
    }, [lobbies, searchQuery, selectedStatus]);

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
                            const normalizedStatus = normalizeStatus(lobby.status);
                            const safeName = lobby.name || "Untitled lobby";
                            const safeDescription = lobby.description || "No description available.";
                            const safeCurrentParticipants = Number(lobby.currentParticipants) || 0;
                            const safeMaxParticipants = Number(lobby.maxParticipants) || 0;
                            const isRegistered = myLobbyIds.has(lobby._id);
                            const isFull = safeMaxParticipants > 0 && safeCurrentParticipants >= safeMaxParticipants;
                            const action = getCardAction(normalizedStatus, isRegistered, isFull);
                            return (
                                <article
                                    key={lobby._id}
                                    className="group rounded-2xl border border-[var(--neutral-border)]/50 bg-[var(--neutral-surface)]/35 backdrop-blur-lg p-5 transition-all duration-500 hover:-translate-y-1.5 hover:border-[var(--brand-primary)]/40 hover:shadow-2xl hover:shadow-[var(--brand-primary)]/10"
                                >
                                    <div className="flex items-start justify-between gap-3 mb-4">
                                        <h3 className="text-2xl font-bold leading-tight">{safeName}</h3>
                                        <span
                                            className={
                                                "capitalize text-[10px] font-bold px-2.5 py-1 rounded-full border " +
                                                STATUS_CLASS[normalizedStatus]
                                            }
                                        >
                                            {STATUS_LABEL[normalizedStatus]}
                                        </span>
                                    </div>

                                    <p className="text-sm text-[var(--neutral-text-secondary)] min-h-12 mb-5">
                                        {safeDescription}
                                    </p>

                                    <div className="space-y-3 mb-5">
                                        <div className="flex items-center gap-2 text-sm text-[var(--neutral-text-secondary)]">
                                            <Calendar size={14} />
                                            <span>{formatDate(lobby.matchDateTime)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-[var(--neutral-text-secondary)]">
                                            <Users size={14} />
                                            <span>
                                                {safeCurrentParticipants}/{safeMaxParticipants} participants
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--brand-primary)]">
                                            <Trophy size={14} />
                                            <span>{estimatePrize(safeMaxParticipants)}</span>
                                        </div>
                                    </div>

                                    <Button
                                        variant={action.variant}
                                        className="w-full py-2.5"
                                        disabled={action.disabled}
                                        onClick={function () {
                                            if (action.label === "Register now") {
                                                void handleRegister(lobby._id);
                                            }
                                        }}
                                    >
                                        {action.label}
                                    </Button>
                                </article>
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
