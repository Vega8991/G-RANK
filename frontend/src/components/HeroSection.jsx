import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import Button from "./Button";
import ReactiveBackground from "./ReactiveBackground";
import { Zap, ArrowRight, Trophy, Users, Award, TrendingUp, Flame, Crown, Star } from "lucide-react";

export default function HeroSection() {
    let [activeTournaments, setActiveTournaments] = useState(0);
    let [activePlayers, setActivePlayers] = useState(0);
    let [proTeams, setProTeams] = useState(0);
    let [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    let topPlayers = [
        { rank: 1, name: "Garrax", mmr: 3420, winRate: "85%", icon: Crown },
        { rank: 2, name: "ProGamer99", mmr: 3280, winRate: "78%", icon: Star },
        { rank: 3, name: "NinjaStrike", mmr: 3150, winRate: "76%", icon: Flame }
    ];

    useEffect(function () {
        let animationFrame;
        const start = performance.now();
        const duration = 1100;

        function animate(time) {
            const elapsed = time - start;
            const progress = Math.min(1, elapsed / duration);

            setActiveTournaments(Math.round(3 * progress));
            setActivePlayers(Math.round(1200 * progress));
            setProTeams(Math.round(9 * progress));

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            }
        }

        animationFrame = requestAnimationFrame(animate);

        return function () {
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
        };
    }, []);

    function handleMouseMove(event) {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = (event.clientX - (rect.left + rect.width / 2)) / rect.width;
        const y = (event.clientY - (rect.top + rect.height / 2)) / rect.height;
        setMousePos({ x, y });
    }

    return (
        <section
            className="relative py-20 md:py-32 px-4 md:px-20 overflow-hidden bg-[var(--neutral-bg)]"
            onMouseMove={handleMouseMove}
        >
            <ReactiveBackground mousePos={mousePos} />
            <div className="relative max-w-[1512px] mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
                    <motion.div
                        className="space-y-8"
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--neutral-surface)] border border-[var(--neutral-border)]">
                                <div className="w-2 h-2 rounded-full bg-[var(--brand-primary)] animate-pulse"></div>
                                <span className="text-xs font-bold tracking-wider text-[var(--neutral-text-secondary)]">
                                    COMPETITIVE ESPORTS PLATFORM
                                </span>
                            </div>

                            <motion.div
                                className="inline-block relative"
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                            >
                                <div className="pointer-events-none absolute -inset-1 rounded-3xl bg-gradient-to-r from-[var(--brand-primary)]/40 via-[var(--rank-elite)]/40 to-[var(--brand-primary)]/40 blur-xl opacity-60 animate-pulse"></div>
                                <h1 className="relative text-5xl md:text-7xl font-extrabold leading-[1.1] tracking-tight">
                                    DOMINATE THE
                                    <br />
                                    <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-[var(--brand-primary)] to-[var(--rank-elite)]">
                                        LEADERBOARD
                                    </span>
                                </h1>
                            </motion.div>

                            <p className="text-xl md:text-2xl text-[var(--neutral-text-secondary)] leading-relaxed max-w-lg">
                                Join the ultimate competitive platform. Compete in tournaments, climb ranks, and prove you're elite.
                            </p>
                        </div>

                        <motion.div
                            className="flex flex-wrap gap-4"
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.35, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <NavLink to="/register">
                                <Button className="group px-8 py-3 transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-lg">
                                    <span className="relative flex items-center gap-2">
                                        <span className="absolute -inset-2 rounded-full bg-[var(--brand-primary)]/40 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                                        <span className="relative flex items-center gap-2">
                                            <span className="inline-flex items-center justify-center">
                                                <Zap size={18} className="animate-pulse" />
                                            </span>
                                            <span>Start Competing</span>
                                        </span>
                                    </span>
                                </Button>
                            </NavLink>
                            <NavLink to="/login">
                                <Button variant="outline" className="px-8 py-3 transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-lg">
                                    Login
                                </Button>
                            </NavLink>
                            <NavLink to="/leaderboard">
                                <Button variant="outline" className="px-8 py-3 transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-lg">
                                    <ArrowRight size={18} /> View Rankings
                                </Button>
                            </NavLink>
                        </motion.div>

                        <motion.div
                            className="flex gap-8 pt-8"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                delay: 0.5,
                                duration: 0.9,
                                ease: [0.16, 1, 0.3, 1]
                            }}
                        >
                            <div className="flex items-center gap-3 transition-transform duration-300 hover:-translate-y-1 hover:scale-105">
                                <div className="w-10 h-10 rounded-lg bg-[var(--brand-primary)]/10 flex items-center justify-center">
                                    <Trophy size={20} className="text-[var(--brand-primary)]" />
                                </div>
                                <div>
                                    <p className="text-2xl font-extrabold">{activeTournaments}</p>
                                    <p className="text-xs text-[var(--neutral-text-secondary)]">Active Tournaments</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 transition-transform duration-300 hover:-translate-y-1 hover:scale-105">
                                <div className="w-10 h-10 rounded-lg bg-[var(--status-success)]/10 flex items-center justify-center">
                                    <Users size={20} className="text-[var(--status-success)]" />
                                </div>
                                <div>
                                    <p className="text-2xl font-extrabold">
                                        {activePlayers ? activePlayers.toLocaleString() : "0"}
                                    </p>
                                    <p className="text-xs text-[var(--neutral-text-secondary)]">Active Players</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 transition-transform duration-300 hover:-translate-y-1 hover:scale-105">
                                <div className="w-10 h-10 rounded-lg bg-[var(--status-warning)]/10 flex items-center justify-center">
                                    <Award size={20} className="text-[var(--status-warning)]" />
                                </div>
                                <div>
                                    <p className="text-2xl font-extrabold">{proTeams}</p>
                                    <p className="text-xs text-[var(--neutral-text-secondary)]">Pro Teams</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        className="relative"
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <div
                            className="bg-[var(--neutral-surface)] border border-[var(--neutral-border)] rounded-2xl p-8 backdrop-blur-sm will-change-transform"
                            style={{
                                boxShadow: "var(--shadow-card)",
                                transform:
                                    "perspective(1000px) rotateX(" +
                                    mousePos.y * -8 +
                                    "deg) rotateY(" +
                                    mousePos.x * 8 +
                                    "deg) translate3d(" +
                                    mousePos.x * 16 +
                                    "px, " +
                                    mousePos.y * 16 +
                                    "px, 0)",
                                transition: "transform 200ms ease-out"
                            }}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-sm font-bold text-white">Top Elite Players</h3>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/20">
                                    <div className="w-2 h-2 rounded-full bg-[var(--brand-primary)] animate-pulse"></div>
                                    <span className="text-xs font-semibold text-[var(--brand-primary)]">Live</span>
                                </div>
                            </div>

                            <div className="space-y-3 mb-6">
                                {topPlayers.map(function (player) {
                                    let IconComponent = player.icon;
                                    let isFirst = player.rank === 1;
                                    let cardClass =
                                        isFirst
                                            ? "bg-gradient-to-r from-[var(--brand-primary)]/20 to-transparent border-[var(--brand-primary)]/40"
                                            : "bg-[var(--neutral-bg)] border-[var(--neutral-border)]";

                                    return (
                                        <div
                                            key={player.rank}
                                            className={
                                                "border rounded-lg p-4 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg " +
                                                cardClass
                                            }
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={
                                                        "w-10 h-10 rounded flex items-center justify-center text-sm font-bold " +
                                                        (isFirst
                                                            ? "bg-[var(--brand-primary)] text-white"
                                                            : "bg-[var(--neutral-surface)] text-[var(--neutral-text-secondary)]")
                                                    }
                                                >
                                                    {player.rank}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-semibold text-sm text-white">{player.name}</p>
                                                    <p className="text-xs text-[var(--neutral-text-muted)]">
                                                        {player.mmr} MMR
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p
                                                        className={
                                                            "text-sm font-bold " +
                                                            (isFirst
                                                                ? "text-[var(--brand-primary)]"
                                                                : "text-[var(--neutral-text-secondary)]")
                                                        }
                                                    >
                                                        {player.winRate}
                                                    </p>
                                                    <p className="text-xs text-[var(--neutral-text-muted)]">Win Rate</p>
                                                </div>
                                                <IconComponent
                                                    size={16}
                                                    className={
                                                        isFirst
                                                            ? "text-[var(--brand-primary)]"
                                                            : "text-[var(--neutral-text-muted)]"
                                                    }
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="flex justify-center gap-2 pt-4 border-t border-[var(--neutral-border)]">
                                {[Trophy, Users, Award].map(function (Icon, idx) {
                                    return (
                                        <div
                                            key={idx}
                                            className="w-10 h-10 rounded border border-[var(--neutral-border)] flex items-center justify-center hover:scale-110 transition-transform duration-300 ease-out text-[var(--neutral-text-secondary)]"
                                        >
                                            <Icon size={16} />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div
                            className="hidden lg:block absolute -top-6 -right-6 bg-[var(--neutral-surface)] border border-[var(--neutral-border)] rounded-xl p-4 backdrop-blur-sm will-change-transform"
                            style={{
                                boxShadow: "var(--shadow-soft)",
                                transform:
                                    "translate3d(" +
                                    mousePos.x * 24 +
                                    "px, " +
                                    mousePos.y * -12 +
                                    "px, 0)",
                                transition: "transform 250ms ease-out"
                            }}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-[var(--status-success)]/10 flex items-center justify-center">
                                    <TrendingUp size={20} className="text-[var(--status-success)]" />
                                </div>
                                <div>
                                    <p className="text-sm text-[var(--neutral-text-muted)]">Avg Win Rate</p>
                                    <p className="text-xl font-extrabold">68%</p>
                                </div>
                            </div>
                        </div>

                        <div
                            className="hidden lg:block absolute -bottom-6 -left-6 bg-[var(--neutral-surface)] border border-[var(--neutral-border)] rounded-xl p-4 backdrop-blur-sm will-change-transform"
                            style={{
                                boxShadow: "var(--shadow-soft)",
                                transform:
                                    "translate3d(" +
                                    mousePos.x * -18 +
                                    "px, " +
                                    mousePos.y * 16 +
                                    "px, 0)",
                                transition: "transform 250ms ease-out"
                            }}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-[var(--brand-primary)]/10 flex items-center justify-center">
                                    <Flame size={20} className="text-[var(--brand-primary)]" />
                                </div>
                                <div>
                                    <p className="text-sm text-[var(--neutral-text-muted)]">Active Now</p>
                                    <p className="text-xl font-extrabold">342</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

        </section>
    );
}

