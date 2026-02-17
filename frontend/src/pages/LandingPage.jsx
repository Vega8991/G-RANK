import { NavLink } from "react-router-dom";
import Button from "../components/Button";
import Card from "../components/Card";
import { Zap, ArrowRight, Trophy, Target, TrendingUp, BarChart3, Users, Award, Home, Shield, CheckCircle2, Crown, Flame, Star, Gem } from "lucide-react";

export default function LandingPage() {
    let topPlayers = [
        { rank: 1, name: "Garrax", mmr: 3420, winRate: "85%", icon: Crown },
        { rank: 2, name: "ProGamer99", mmr: 3280, winRate: "78%", icon: Star },
        { rank: 3, name: "NinjaStrike", mmr: 3150, winRate: "76%", icon: Flame }
    ];

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

    return (
        <div className="bg-[var(--neutral-bg)] text-white">
            <section className="relative py-20 md:py-32 px-4 md:px-20 overflow-hidden">
                <div className="max-w-[1512px] mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
                        <div className="space-y-8">
                            <div className="space-y-6">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--neutral-surface)] border border-[var(--neutral-border)]">
                                    <div className="w-2 h-2 rounded-full bg-[var(--brand-primary)] animate-pulse"></div>
                                    <span className="text-xs font-bold tracking-wider text-[var(--neutral-text-secondary)]">COMPETITIVE ESPORTS PLATFORM</span>
                                </div>

                                <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.1] tracking-tight">
                                    DOMINATE THE<br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--brand-primary)] to-[var(--rank-elite)]">
                                        LEADERBOARD
                                    </span>
                                </h1>

                                <p className="text-xl md:text-2xl text-[var(--neutral-text-secondary)] leading-relaxed max-w-lg">
                                    Join the ultimate competitive platform. Compete in tournaments, climb ranks, and prove you're elite.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-4">
                                <NavLink to="/register">
                                    <Button className="px-8 py-3">
                                        <Zap size={18} /> Start Competing
                                    </Button>
                                </NavLink>
                                <NavLink to="/login">
                                    <Button variant="outline" className="px-8 py-3">
                                        Login
                                    </Button>
                                </NavLink>
                                <NavLink to="/leaderboard">
                                    <Button variant="outline" className="px-8 py-3">
                                        <ArrowRight size={18} /> View Rankings
                                    </Button>
                                </NavLink>
                            </div>

                            <div className="flex gap-8 pt-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-[var(--brand-primary)]/10 flex items-center justify-center">
                                        <Trophy size={20} className="text-[var(--brand-primary)]" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-extrabold">3</p>
                                        <p className="text-xs text-[var(--neutral-text-secondary)]">Active Tournaments</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-[var(--status-success)]/10 flex items-center justify-center">
                                        <Users size={20} className="text-[var(--status-success)]" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-extrabold">1.2K+</p>
                                        <p className="text-xs text-[var(--neutral-text-secondary)]">Active Players</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-[var(--status-warning)]/10 flex items-center justify-center">
                                        <Award size={20} className="text-[var(--status-warning)]" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-extrabold">9</p>
                                        <p className="text-xs text-[var(--neutral-text-secondary)]">Pro Teams</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="bg-[var(--neutral-surface)] border border-[var(--neutral-border)] rounded-2xl p-8 backdrop-blur-sm" style={{ boxShadow: "var(--shadow-card)" }}>
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
                                        let cardClass = isFirst 
                                            ? "bg-gradient-to-r from-[var(--brand-primary)]/20 to-transparent border-[var(--brand-primary)]/40" 
                                            : "bg-[var(--neutral-bg)] border-[var(--neutral-border)]";
                                        
                                        return (
                                            <div key={player.rank} className={"border rounded-lg p-4 transition-all hover:-translate-y-1 " + cardClass}>
                                                <div className="flex items-center gap-3">
                                                    <div className={"w-10 h-10 rounded flex items-center justify-center text-sm font-bold " + (isFirst ? "bg-[var(--brand-primary)] text-white" : "bg-[var(--neutral-surface)] text-[var(--neutral-text-secondary)]")}>
                                                        {player.rank}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-semibold text-sm text-white">{player.name}</p>
                                                        <p className="text-xs text-[var(--neutral-text-muted)]">{player.mmr} MMR</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className={"text-sm font-bold " + (isFirst ? "text-[var(--brand-primary)]" : "text-[var(--neutral-text-secondary)]")}>{player.winRate}</p>
                                                        <p className="text-xs text-[var(--neutral-text-muted)]">Win Rate</p>
                                                    </div>
                                                    <IconComponent size={16} className={isFirst ? "text-[var(--brand-primary)]" : "text-[var(--neutral-text-muted)]"} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="flex justify-center gap-2 pt-4 border-t border-[var(--neutral-border)]">
                                    {ranks.map(function (rank, idx) {
                                        let RankIcon = rank.icon;
                                        return (
                                            <div key={idx} className="w-10 h-10 rounded border border-[var(--neutral-border)] flex items-center justify-center hover:scale-110 transition-transform" style={{ color: rank.color }}>
                                                <RankIcon size={16} />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="hidden lg:block absolute -top-6 -right-6 bg-[var(--neutral-surface)] border border-[var(--neutral-border)] rounded-xl p-4 backdrop-blur-sm" style={{ boxShadow: "var(--shadow-soft)" }}>
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

                            <div className="hidden lg:block absolute -bottom-6 -left-6 bg-[var(--neutral-surface)] border border-[var(--neutral-border)] rounded-xl p-4 backdrop-blur-sm" style={{ boxShadow: "var(--shadow-soft)" }}>
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
                        </div>
                    </div>
                </div>

                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--brand-primary)] rounded-full blur-[128px] opacity-30 pointer-events-none"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--rank-elite)] rounded-full blur-[128px] opacity-30 pointer-events-none"></div>
            </section>


            <section className="py-20 md:py-28 px-4 md:px-20 bg-[var(--neutral-surface)]">
                <div className="max-w-[1512px] mx-auto">
                    <div className="text-center mb-16 space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/20">
                            <Shield size={16} className="text-[var(--brand-primary)]" />
                            <span className="text-xs font-bold tracking-wider text-[var(--brand-primary)]">7-TIER PROGRESSION</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-extrabold">CLIMB THE RANKS</h2>
                        <p className="text-xl text-[var(--neutral-text-secondary)] max-w-2xl mx-auto leading-relaxed">
                            Progress through seven distinct competitive ranks. Each victory brings you closer to Elite status.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-6 mb-12">
                        {ranks.map(function (rank) {
                            let RankIcon = rank.icon;
                            return (
                                <div key={rank.name} className="group bg-[var(--neutral-bg)] border border-[var(--neutral-border)] rounded-xl p-6 text-center hover:border-[var(--neutral-border)] hover:-translate-y-1 transition-all">
                                    <div className="w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform" style={{ backgroundColor: rank.color + "20" }}>
                                        <RankIcon size={24} style={{ color: rank.color }} />
                                    </div>
                                    <p className="text-sm font-bold mb-2">{rank.name}</p>
                                    <p className="text-xs text-[var(--neutral-text-muted)]">{rank.mmr}</p>
                                </div>
                            );
                        })}
                    </div>

                    <div className="bg-[var(--neutral-bg)] border border-[var(--neutral-border)] rounded-xl p-8 max-w-3xl mx-auto">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-[var(--brand-primary)] tracking-wider">YOUR PROGRESS</span>
                            <Shield size={16} className="text-[var(--brand-primary)]" />
                        </div>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-lg font-bold">2,449 / 3,000 MMR</span>
                            <span className="text-sm text-[var(--neutral-text-muted)]">Diamond</span>
                        </div>
                        <div className="relative w-full h-3 bg-[var(--neutral-surface)] rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-[var(--brand-primary)] to-[var(--rank-elite)] rounded-full relative"
                                style={{ width: "98%" }}
                            >
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-2 border-[var(--brand-primary)]"></div>
                            </div>
                        </div>
                        <p className="text-xs text-[var(--neutral-text-muted)] mt-3">50 MMR to Master</p>
                    </div>
                </div>
            </section>

            <section className="py-20 md:py-28 px-4 md:px-20">
                <div className="max-w-[1512px] mx-auto">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-4xl md:text-5xl font-extrabold">
                            EVERYTHING YOU NEED TO <span className="text-[var(--brand-primary)]">COMPETE</span>
                        </h2>
                        <p className="text-xl text-[var(--neutral-text-secondary)] max-w-2xl mx-auto leading-relaxed">
                            Professional-grade tools and features designed for competitive esports excellence.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map(function (feature, idx) {
                            let IconComponent = feature.icon;
                            return (
                                <div key={idx} className="group bg-[var(--neutral-surface)] border border-[var(--neutral-border)] rounded-xl p-8 hover:border-[var(--neutral-border)] hover:-translate-y-1 transition-all">
                                    <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform" style={{ background: "linear-gradient(135deg, " + feature.color + "20, " + feature.color + "05)" }}>
                                        <IconComponent size={28} style={{ color: feature.color }} />
                                    </div>
                                    <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                    <p className="text-sm text-[var(--neutral-text-secondary)] leading-relaxed mb-4">{feature.desc}</p>
                                    <button className="flex items-center gap-2 text-sm font-semibold group-hover:gap-3 transition-all" style={{ color: feature.color }}>
                                        Learn more <ArrowRight size={16} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section className="relative py-20 md:py-28 px-4 md:px-20 overflow-hidden">
                <div className="max-w-[1512px] mx-auto relative z-10">
                    <div className="bg-[var(--neutral-surface)] border-2 border-[var(--brand-primary)]/30 rounded-2xl p-12 md:p-16 text-center" style={{ boxShadow: "var(--shadow-card)" }}>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/20 mb-6">
                            <Crown size={16} className="text-[var(--brand-primary)]" />
                            <span className="text-xs font-bold tracking-wider text-[var(--brand-primary)]">JOIN THE ELITE</span>
                        </div>

                        <h2 className="text-4xl md:text-5xl font-extrabold mb-6">READY TO COMPETE?</h2>
                        
                        <p className="text-xl text-[var(--neutral-text-secondary)] max-w-2xl mx-auto leading-relaxed mb-12">
                            Join thousands of players competing for glory. Create your account and start your journey to Elite rank today.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mx-auto mb-12">
                            {[
                                "Competitive ranking system",
                                "Weekly tournament schedule",
                                "Real-time match tracking",
                                "Detailed performance stats",
                                "Global leaderboards",
                                "Team coordination tools"
                            ].map(function (benefit, idx) {
                                return (
                                    <div key={idx} className="flex items-center gap-3 text-left">
                                        <div className="w-6 h-6 rounded-full bg-[var(--status-success)]/20 flex items-center justify-center flex-shrink-0">
                                            <CheckCircle2 size={14} className="text-[var(--status-success)]" />
                                        </div>
                                        <span className="text-sm text-[var(--neutral-text-secondary)]">{benefit}</span>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex flex-wrap justify-center gap-4 mb-8">
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
                        </div>

                        <p className="text-xs text-[var(--neutral-text-muted)]">
                            No credit card required • Free to join • Start competing in minutes
                        </p>
                    </div>
                </div>

                <div className="absolute top-0 left-1/3 w-96 h-96 bg-[var(--brand-primary)] rounded-full blur-[120px] opacity-20 pointer-events-none"></div>
                <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-[var(--rank-elite)] rounded-full blur-[120px] opacity-20 pointer-events-none"></div>
            </section>

            <footer className="border-t border-[var(--neutral-border)] bg-[var(--neutral-surface)]">
                <div className="max-w-[1512px] mx-auto px-6 md:px-20 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 rounded bg-[var(--brand-primary)] flex items-center justify-center">
                                    <span className="text-white font-extrabold text-sm">G</span>
                                </div>
                                <span className="font-extrabold text-lg">G-RANK</span>
                            </div>
                            <p className="text-sm text-[var(--neutral-text-secondary)] max-w-xs">
                                Pro esports platform with MMR-based matchmaking and competitive tournaments.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-bold text-sm mb-4">GAMES</h4>
                            <div className="space-y-2">
                                <NavLink to="/" className="block text-sm text-[var(--neutral-text-secondary)] hover:text-white transition-colors">Rocket League</NavLink>
                                <NavLink to="/" className="block text-sm text-[var(--neutral-text-secondary)] hover:text-white transition-colors">League of Legends</NavLink>
                                <NavLink to="/" className="block text-sm text-[var(--neutral-text-secondary)] hover:text-white transition-colors">Valorant</NavLink>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold text-sm mb-4">TIERS</h4>
                            <div className="space-y-2">
                                <NavLink to="/" className="block text-sm text-[var(--neutral-text-secondary)] hover:text-white transition-colors">Bronze & Silver</NavLink>
                                <NavLink to="/" className="block text-sm text-[var(--neutral-text-secondary)] hover:text-white transition-colors">Gold & Platinum</NavLink>
                                <NavLink to="/" className="block text-sm text-[var(--neutral-text-secondary)] hover:text-white transition-colors">Master & Elite</NavLink>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-[var(--neutral-border)] flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-xs text-[var(--neutral-text-muted)]">© 2025 G-RANK. All rights reserved.</p>
                        <div className="flex gap-6">
                            <NavLink to="/" className="text-xs text-[var(--neutral-text-secondary)] hover:text-white transition-colors">Privacy Policy</NavLink>
                            <NavLink to="/" className="text-xs text-[var(--neutral-text-secondary)] hover:text-white transition-colors">Terms of Service</NavLink>
                            <NavLink to="/" className="text-xs text-[var(--neutral-text-secondary)] hover:text-white transition-colors">Contact Us</NavLink>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}