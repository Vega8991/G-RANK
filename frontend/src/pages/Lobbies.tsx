import { useDeferredValue, useMemo, useRef, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Calendar, Filter, Search, Trophy, Users, CheckCircle2, Plus } from "lucide-react";
import Button from "../components/common/Button";
import { useLobbies } from "../hooks/useLobbies";
import type { Lobby } from "../types";
import LobbiesBackground from "../components/lobbies/LobbiesBackground";
import LobbyCard, { GAME_CONFIG, type GameType, type GameConfig, type UiLobbyStatus, type LobbyCardData } from "../components/lobbies/LobbyCard";

type LobbyStatusFilter = "all" | UiLobbyStatus;

const FILTERS: Array<{ value: LobbyStatusFilter; label: string }> = [
    { value: "all",         label: "All"         },
    { value: "open",        label: "Registering" },
    { value: "pending",     label: "Pending"     },
    { value: "in_progress", label: "Live"        },
    { value: "completed",   label: "Completed"   },
    { value: "cancelled",   label: "Cancelled"   }
];

function normalizeGame(game: unknown): GameType {
    if (game === "league_of_legends" || game === "valorant") return game;
    return "pokemon_showdown";
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

function formatDate(value: string): string {
    if (!value) return "Date pending";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Date pending";
    return date.toLocaleString("es-ES", { month: "short", day: "numeric", year: "numeric" });
}

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

export default function Lobbies() {
    const { lobbies, myLobbies, userRiotLinked, successMessage, errorMessage, result, handleRegister, handleLeave, handleCreate: submitCreateLobby, handleSubmitReplay } = useLobbies();

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
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatus, setSelectedStatus] = useState<LobbyStatusFilter>("all");
    const deferredSearchQuery = useDeferredValue(searchQuery);
    const registrationDeadlineRef = useRef<HTMLInputElement>(null);
    const matchDateTimeRef = useRef<HTMLInputElement>(null);
    const createPanelRef = useRef<HTMLDivElement>(null);

    async function handleCreate(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        try {
            await submitCreateLobby({
                name,
                description,
                maxParticipants: parseInt(maxParticipants) || 0,
                prizePool: hasPrize ? prizePool : "",
                registrationDeadline,
                matchDateTime,
                game: selectedGame,
            });
            setName(""); setDescription(""); setMaxParticipants("");
            setHasPrize(false); setPrizePool(""); setRegistrationDeadline(""); setMatchDateTime("");
            setSelectedGame("pokemon_showdown");
        } catch { }
    }

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        try {
            await handleSubmitReplay(selectedLobby, replayUrl);
            setReplayUrl("");
        } catch { }
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
                <div className="max-w-[1512px] mx-auto px-4 md:px-20 pt-8 md:pt-14 pb-10">
                    <motion.div
                        initial={{ opacity: 0, y: 28 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <p className="text-[10px] font-bold tracking-[0.35em] uppercase text-white/25 mb-4">Competitive Arena</p>
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                            <div>
                                <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight leading-none mb-3">
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

                <section className="max-w-[1512px] mx-auto px-4 md:px-20 pb-16 space-y-6">
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

                    {successMessage && (
                        <motion.div
                            className="rounded-xl px-4 py-3 text-sm font-medium"
                            style={{ border: "1px solid rgba(34,197,94,0.3)", background: "rgba(34,197,94,0.08)", color: "rgb(134,239,172)" }}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                        >
                            {successMessage}
                        </motion.div>
                    )}
                    {errorMessage && (
                        <motion.div
                            className="rounded-xl px-4 py-3 text-sm font-medium"
                            style={{ border: "1px solid rgba(220,20,60,0.3)", background: "rgba(220,20,60,0.08)", color: "var(--brand-primary)" }}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                        >
                            {errorMessage}
                        </motion.div>
                    )}
                </section>

                <section className="max-w-[1512px] mx-auto px-4 md:px-20 pb-20">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
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
                                        <input type="number" placeholder="Max participants" min={2} max={100} value={maxParticipants} onChange={function (e) { setMaxParticipants(e.target.value); }} className={inputCls + " pl-9"} style={inputStyle} required />
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
                                        <span className="w-24 sm:w-36 shrink-0 text-xs sm:text-sm">Reg. deadline</span>
                                        <input ref={registrationDeadlineRef} type="datetime-local" value={registrationDeadline} onChange={function (e) { setRegistrationDeadline(e.target.value); }} className="flex-1 h-10 rounded-xl px-3 text-sm text-white outline-none" style={inputStyle} required />
                                    </label>

                                    <label className="flex items-center gap-3 text-sm text-white/35">
                                        <Calendar size={16} className="cursor-pointer shrink-0" onClick={function () { matchDateTimeRef.current?.showPicker(); }} />
                                        <span className="w-24 sm:w-36 shrink-0 text-xs sm:text-sm">Match date</span>
                                        <input ref={matchDateTimeRef} type="datetime-local" value={matchDateTime} onChange={function (e) { setMatchDateTime(e.target.value); }} className="flex-1 h-10 rounded-xl px-3 text-sm text-white outline-none" style={inputStyle} required />
                                    </label>

                                    <Button className="w-full py-3 font-bold tracking-wide">Create lobby</Button>
                                </form>
                            </div>
                        </motion.div>

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
