import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import HeroSection from "../components/landing/HeroSection";
import SponsorsMarquee from "../components/landing/SponsorsMarquee";
import LiquidEther from "../components/ui/LiquidEther";
import { Zap, ArrowRight, Trophy, Target, TrendingUp, BarChart3, Users, Award, Home, Shield, CheckCircle2, Crown, Flame, Star, Gem } from "lucide-react";

export default function LandingPage() {
    let ranks = [
        { name: "Bronze", mmr: "0-500 MMR", color: "var(--rank-bronze)", icon: Award },
        { name: "Silver", mmr: "500-1000 MMR", color: "var(--rank-silver)", icon: Star },
        { name: "Gold", mmr: "1000-1500 MMR", color: "var(--rank-gold)", icon: Trophy },
        { name: "Platinum", mmr: "1500-2000 MMR", color: "var(--rank-platinum)", icon: Gem },
        { name: "Diamond", mmr: "2000-2500 MMR", color: "var(--rank-diamond)", icon: Gem },
        { name: "Master", mmr: "2500-3000 MMR", color: "var(--rank-master)", icon: Crown },
        { name: "Elite", mmr: "3000+ MMR", color: "var(--rank-elite)", icon: Flame }
    ];

    let features = [
        { 
            icon: Trophy, 
            title: "Weekly Tournaments", 
            desc: "Compete in structured tournaments with prize pools. Track brackets, schedules, and results in real-time.",
            color: "var(--brand-primary)"
        },
        { 
            icon: Target, 
            title: "MMR System", 
            desc: "Fair matchmaking based on skill rating. Climb ranks with every win and improve your competitive standing.",
            color: "var(--status-warning)"
        },
        { 
            icon: TrendingUp, 
            title: "Global Rankings", 
            desc: "Compare your performance against the best players worldwide. Detailed stats and leaderboards.",
            color: "var(--status-success)"
        },
        { 
            icon: BarChart3, 
            title: "Performance Analytics", 
            desc: "Track your progress with detailed statistics, match history, and performance metrics.",
            color: "#9333EA"
        },
        { 
            icon: Users, 
            title: "Team Management", 
            desc: "Create or join teams, coordinate strategies, and compete together in team tournaments.",
            color: "#0EA5E9"
        },
        { 
            icon: Award, 
            title: "Achievement System", 
            desc: "Unlock exclusive achievements, showcase your accomplishments, and earn special rewards.",
            color: "var(--status-warning)"
        }
    ];

    const [selectedRank, setSelectedRank] = useState(ranks[4]);
    const [featureIndex, setFeatureIndex] = useState(0);

    const selectedRankIndex = ranks.findIndex(function (rank) {
        return rank.name === selectedRank.name;
    });
    const selectedRankProgress = ((selectedRankIndex + 1) / ranks.length) * 100;

    useEffect(function () {
        if (features.length <= 1) {
            return;
        }

        const interval = setInterval(function () {
            setFeatureIndex(function (prev) {
                return (prev + 1) % features.length;
            });
        }, 4500);

        return function () {
            clearInterval(interval);
        };
    }, []);

    return (
        <div className="bg-[var(--neutral-bg)] text-white relative">
            <div className="fixed inset-0 z-0 w-screen h-screen overflow-hidden" style={{ pointerEvents: 'none' }}>
                <LiquidEther 
                    className="opacity-100"
                    colors={['#ff242f', '#b12020', '#d22828']}
                    mouseForce={35}
                    cursorSize={65}
                    isViscous={true}
                    viscous={30}
                    iterationsViscous={32}
                    iterationsPoisson={47}
                    resolution={0.5}
                    isBounce={true}
                    autoDemo={true}
                    autoSpeed={0.5}
                    autoIntensity={4}
                    takeoverDuration={0.25}
                    autoResumeDelay={3000}
                    autoRampDuration={0.6}
                />
            </div>
            <div className="relative z-10 pointer-events-auto">
                <HeroSection />
                <SponsorsMarquee />


            <section className="py-20 md:py-28 px-4 md:px-20">
                <div className="max-w-[1512px] mx-auto">
                    <motion.div
                        className="text-center mb-16 space-y-4"
                        initial={{ opacity: 0, y: 40, scaleY: 0.9 }}
                        whileInView={{ opacity: 1, y: 0, scaleY: 1 }}
                        style={{ originY: 0 }}
                        viewport={{ amount: 0.4 }}
                        transition={{ duration: 0.95, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--brand-primary)]/15 border border-[var(--brand-primary)]/30 backdrop-blur-md shadow-lg shadow-[var(--brand-primary)]/10">
                            <Shield size={16} className="text-[var(--brand-primary)]" />
                            <span className="text-xs font-bold tracking-wider text-[var(--brand-primary)]">7-TIER PROGRESSION</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-extrabold">CLIMB THE RANKS</h2>
                        <p className="text-xl text-[var(--neutral-text-secondary)] max-w-2xl mx-auto leading-relaxed">
                            Progress through seven distinct competitive ranks. Each victory brings you closer to Elite status.
                        </p>
                    </motion.div>

                    <motion.div
                        className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-6 mb-12"
                        initial={{ opacity: 0, y: 40, scaleY: 0.9 }}
                        whileInView={{ opacity: 1, y: 0, scaleY: 1 }}
                        style={{ originY: 0 }}
                        viewport={{ amount: 0.2 }}
                        transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    >
                        {ranks.map(function (rank) {
                            let RankIcon = rank.icon;
                            let isSelected = selectedRank.name === rank.name;

                            return (
                                <div
                                    key={rank.name}
                                    onClick={function () {
                                        setSelectedRank(rank);
                                    }}
                                    className={
                                        "group bg-[var(--neutral-bg)]/60 backdrop-blur-md rounded-xl p-6 text-center cursor-pointer transition-all duration-300 ease-out " +
                                        (isSelected
                                            ? "border-2 border-[var(--brand-primary)] shadow-2xl shadow-[var(--brand-primary)]/20 -translate-y-2 ring-2 ring-[var(--brand-primary)]/30"
                                            : "border border-[var(--neutral-border)]/50 hover:border-[var(--brand-primary)]/50 hover:-translate-y-1 hover:shadow-xl hover:shadow-[var(--brand-primary)]/10 hover:bg-[var(--neutral-bg)]/80")
                                    }
                                >
                                    <div className="relative w-12 h-12 mx-auto mb-4">
                                        <div
                                            className={
                                                "absolute inset-0 rounded-xl border border-dashed opacity-40 group-hover:opacity-80 transition-opacity duration-300 " +
                                                (isSelected ? "border-[var(--brand-primary)]" : "border-[var(--neutral-border)]")
                                            }
                                        ></div>
                                        <div
                                            className="relative w-full h-full rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                                            style={{ backgroundColor: rank.color + "20" }}
                                        >
                                            <RankIcon size={24} style={{ color: rank.color }} />
                                        </div>
                                    </div>
                                    <p className="text-sm font-bold mb-2">{rank.name}</p>
                                    <p className="text-xs text-[var(--neutral-text-muted)]">{rank.mmr}</p>
                                </div>
                            );
                        })}
                    </motion.div>

                    <motion.div
                        className="bg-[var(--neutral-bg)]/50 backdrop-blur-xl border border-[var(--neutral-border)]/50 rounded-2xl p-8 max-w-3xl mx-auto transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[var(--brand-primary)]/10 hover:border-[var(--brand-primary)]/30"
                        initial={{ opacity: 0, y: 40, scaleY: 0.9 }}
                        whileInView={{ opacity: 1, y: 0, scaleY: 1 }}
                        style={{ originY: 0 }}
                        viewport={{ amount: 0.4 }}
                        transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-[var(--brand-primary)] tracking-wider">YOUR PROGRESS</span>
                            <Shield size={16} className="text-[var(--brand-primary)]" />
                        </div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-lg font-bold">2,449 / 3,000 MMR</span>
                            <span className="text-sm text-[var(--neutral-text-muted)]">Diamond</span>
                        </div>
                        <p className="text-xs text-[var(--neutral-text-muted)] mb-4">
                            Selected rank: <span className="font-semibold">{selectedRank.name}</span> &bull; {selectedRank.mmr}
                        </p>
                        <div className="relative w-full h-3 bg-[var(--neutral-surface)] rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-[var(--brand-primary)] to-[var(--rank-elite)] rounded-full relative transition-[width] duration-500 ease-out"
                                style={{ width: selectedRankProgress + "%" }}
                            >
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-2 border-[var(--brand-primary)]"></div>
                            </div>
                        </div>
                        <p className="text-xs text-[var(--neutral-text-muted)] mt-3">50 MMR to Master</p>
                    </motion.div>
                </div>
            </section>

            <section className="py-20 md:py-28 px-4 md:px-20">
                <div className="max-w-[1512px] mx-auto">
                    <motion.div
                        className="text-center mb-16 space-y-4"
                        initial={{ opacity: 0, y: 40, scaleY: 0.9 }}
                        whileInView={{ opacity: 1, y: 0, scaleY: 1 }}
                        style={{ originY: 0 }}
                        viewport={{ amount: 0.4 }}
                        transition={{ duration: 0.95, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <h2 className="text-4xl md:text-5xl font-extrabold">
                            EVERYTHING YOU NEED TO <span className="text-[var(--brand-primary)]">COMPETE</span>
                        </h2>
                        <p className="text-xl text-[var(--neutral-text-secondary)] max-w-2xl mx-auto leading-relaxed">
                            Professional-grade tools and features designed for competitive esports excellence.
                        </p>
                    </motion.div>

                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ amount: 0.2 }}
                        variants={{
                            hidden: {},
                            visible: {
                                transition: {
                                    staggerChildren: 0.15,
                                    delayChildren: 0.2
                                }
                            }
                        }}
                    >
                        {features.map(function (feature, idx) {
                            let IconComponent = feature.icon;
                            return (
                                <motion.div
                                    key={idx}
                                    className="group bg-[var(--neutral-surface)]/40 backdrop-blur-lg border border-[var(--neutral-border)]/40 rounded-2xl p-8 hover:border-[var(--brand-primary)]/40 hover:-translate-y-3 hover:shadow-2xl hover:shadow-[var(--brand-primary)]/10 hover:bg-[var(--neutral-surface)]/60 transition-all duration-500 ease-out"
                                    variants={{
                                        hidden: { opacity: 0, y: 40 },
                                        visible: { opacity: 1, y: 0 }
                                    }}
                                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                >
                                    <div
                                        className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg"
                                        style={{
                                            background:
                                                "linear-gradient(135deg, " +
                                                feature.color +
                                                "30, " +
                                                feature.color +
                                                "10)"
                                        }}
                                    >
                                        <IconComponent size={28} style={{ color: feature.color }} />
                                    </div>
                                    <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                    <p className="text-sm text-[var(--neutral-text-secondary)] leading-relaxed mb-4">
                                        {feature.desc}
                                    </p>
                                    <button
                                        className="flex items-center gap-2 text-sm font-semibold group-hover:gap-3 opacity-70 group-hover:opacity-100 transition-all duration-300"
                                        style={{ color: feature.color }}
                                    >
                                        Learn more <ArrowRight size={16} className="group-hover:translate-x-0.5" />
                                    </button>
                                </motion.div>
                            );
                        })}
                    </motion.div>

                    <div className="max-w-3xl mx-auto">
                        <motion.div
                            className="bg-[var(--neutral-surface)]/60 border border-[var(--neutral-border)]/50 rounded-2xl p-6 md:p-8 backdrop-blur-xl overflow-hidden shadow-xl hover:shadow-2xl hover:border-[var(--brand-primary)]/30 transition-all duration-500"
                            initial={{ opacity: 0, y: 40, scaleY: 0.9 }}
                            whileInView={{ opacity: 1, y: 0, scaleY: 1 }}
                            style={{ originY: 0 }}
                            viewport={{ amount: 0.4 }}
                            transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-bold tracking-wider text-[var(--brand-primary)]">
                                    FEATURE SPOTLIGHT
                                </span>
                                <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--neutral-text-muted)]">
                                    Auto-rotating
                                </span>
                            </div>
                            <div className="relative h-32 md:h-24 overflow-hidden">
                                <div
                                    className="absolute inset-0 flex items-center gap-4 transition-transform duration-500 ease-out"
                                    style={{
                                        transform: "translate3d(0, 0, 0)"
                                    }}
                                >
                                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg" style={{ background: "linear-gradient(135deg, " + features[featureIndex].color + "30, " + features[featureIndex].color + "10)" }}>
                                        {(() => {
                                            const IconComponent = features[featureIndex].icon;
                                            return (
                                                <IconComponent
                                                    size={28}
                                                    style={{ color: features[featureIndex].color }}
                                                />
                                            );
                                        })()}
                                    </div>
                                    <div className="text-left">
                                        <h3 className="text-lg md:text-xl font-bold mb-1">
                                            {features[featureIndex].title}
                                        </h3>
                                        <p className="text-xs md:text-sm text-[var(--neutral-text-secondary)] leading-relaxed">
                                            {features[featureIndex].desc}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2 mt-4 justify-center">
                                {features.map(function (_feature, idx) {
                                    const isActive = idx === featureIndex;
                                    return (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={function () {
                                                setFeatureIndex(idx);
                                            }}
                                            className={
                                                "h-1.5 rounded-full transition-all duration-300 " +
                                                (isActive
                                                    ? "w-6 bg-[var(--brand-primary)]"
                                                    : "w-2 bg-[var(--neutral-border)] hover:bg-[var(--neutral-text-secondary)]")
                                            }
                                        />
                                    );
                                })}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            <section className="relative py-20 md:py-28 px-4 md:px-20 overflow-hidden">
                <div className="max-w-[1512px] mx-auto relative z-10">
                    <motion.div
                        className="bg-[var(--neutral-surface)]/50 backdrop-blur-2xl border-2 border-[var(--brand-primary)]/40 rounded-3xl p-12 md:p-16 text-center shadow-2xl shadow-[var(--brand-primary)]/20 hover:shadow-[var(--brand-primary)]/30 transition-all duration-700"
                        style={{ boxShadow: "0 0 80px rgba(220, 20, 60, 0.15)" }}
                        initial={{ opacity: 0, scaleY: 0.9, scaleX: 0.97 }}
                        whileInView={{ opacity: 1, scaleY: 1, scaleX: 1 }}
                        viewport={{ amount: 0.4 }}
                        transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--brand-primary)]/20 border border-[var(--brand-primary)]/40 mb-6 backdrop-blur-md shadow-lg shadow-[var(--brand-primary)]/20">
                            <Crown size={16} className="text-[var(--brand-primary)] animate-pulse" />
                            <span className="text-xs font-bold tracking-wider text-[var(--brand-primary)]">JOIN THE ELITE</span>
                        </div>

                        <h2 className="text-4xl md:text-5xl font-extrabold mb-6">READY TO COMPETE?</h2>
                        
                        <p className="text-xl text-[var(--neutral-text-secondary)] max-w-2xl mx-auto leading-relaxed mb-12">
                            Join thousands of players competing for glory. Create your account and start your journey to Elite rank today.
                        </p>

                        <motion.div
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mx-auto mb-12"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ amount: 0.3 }}
                            variants={{
                                hidden: {},
                                visible: {
                                    transition: {
                                        staggerChildren: 0.12,
                                        delayChildren: 0.2
                                    }
                                }
                            }}
                        >
                            {[
                                "Competitive ranking system",
                                "Weekly tournament schedule",
                                "Real-time match tracking",
                                "Detailed performance stats",
                                "Global leaderboards",
                                "Team coordination tools"
                            ].map(function (benefit, idx) {
                                return (
                                    <motion.div
                                        key={idx}
                                        className="flex items-center gap-3 text-left"
                                        variants={{
                                            hidden: { opacity: 0, y: 30 },
                                            visible: { opacity: 1, y: 0 }
                                        }}
                                        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                                    >
                                        <div className="w-6 h-6 rounded-full bg-[var(--status-success)]/20 flex items-center justify-center flex-shrink-0">
                                            <CheckCircle2 size={14} className="text-[var(--status-success)]" />
                                        </div>
                                        <span className="text-sm text-[var(--neutral-text-secondary)]">{benefit}</span>
                                    </motion.div>
                                );
                            })}
                        </motion.div>

                        <motion.div
                            className="flex flex-wrap justify-center gap-4 mb-8"
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ amount: 0.4 }}
                            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <NavLink to="/register">
                                <Button className="px-8 py-3">
                                    <Zap size={18} /> Create Free Account
                                </Button>
                            </NavLink>
                            <NavLink to="/tournaments">
                                <Button variant="outline" className="px-8 py-3">
                                    <Trophy size={18} /> View Tournaments
                                </Button>
                            </NavLink>
                        </motion.div>

                        <p className="text-xs text-[var(--neutral-text-muted)]">
                            No credit card required • Free to join • Start competing in minutes
                        </p>
                    </motion.div>
                </div>

                <div className="absolute top-0 left-1/3 w-96 h-96 bg-[var(--brand-primary)] rounded-full blur-[120px] opacity-20 pointer-events-none"></div>
                <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-[var(--rank-elite)] rounded-full blur-[120px] opacity-20 pointer-events-none"></div>
            </section>

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
                                Pro esports platform with MMR-based matchmaking and competitive tournaments.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-bold text-sm mb-4 text-[var(--neutral-text)] tracking-wide">GAMES</h4>
                            <div className="space-y-3">
                                <NavLink to="/" className="block text-sm text-[var(--neutral-text-secondary)] hover:text-white hover:translate-x-1 transition-all duration-300">Rocket League</NavLink>
                                <NavLink to="/" className="block text-sm text-[var(--neutral-text-secondary)] hover:text-white hover:translate-x-1 transition-all duration-300">League of Legends</NavLink>
                                <NavLink to="/" className="block text-sm text-[var(--neutral-text-secondary)] hover:text-white hover:translate-x-1 transition-all duration-300">Valorant</NavLink>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold text-sm mb-4 text-[var(--neutral-text)] tracking-wide">TIERS</h4>
                            <div className="space-y-3">
                                <NavLink to="/" className="block text-sm text-[var(--neutral-text-secondary)] hover:text-white hover:translate-x-1 transition-all duration-300">Bronze & Silver</NavLink>
                                <NavLink to="/" className="block text-sm text-[var(--neutral-text-secondary)] hover:text-white hover:translate-x-1 transition-all duration-300">Gold & Platinum</NavLink>
                                <NavLink to="/" className="block text-sm text-[var(--neutral-text-secondary)] hover:text-white hover:translate-x-1 transition-all duration-300">Master & Elite</NavLink>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-[var(--neutral-border)]/30 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-xs text-[var(--neutral-text-muted)] flex items-center gap-2">
                            © 2025 G-RANK. All rights reserved.
                        </p>
                        <div className="flex gap-6">
                            <NavLink to="/" className="text-xs text-[var(--neutral-text-secondary)] hover:text-white hover:translate-y-[-2px] transition-all duration-300">Privacy Policy</NavLink>
                            <NavLink to="/" className="text-xs text-[var(--neutral-text-secondary)] hover:text-white hover:translate-y-[-2px] transition-all duration-300">Terms of Service</NavLink>
                            <NavLink to="/" className="text-xs text-[var(--neutral-text-secondary)] hover:text-white hover:translate-y-[-2px] transition-all duration-300">Contact Us</NavLink>
                        </div>
                    </div>
                </div>
            </footer>
            </div>
        </div>
    );
}