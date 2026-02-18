import { memo } from "react";
import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import { Zap, Trophy, Crown, CheckCircle2 } from "lucide-react";
import Button from "../common/Button";

const benefits = [
    "Competitive ranking system",
    "Weekly tournament schedule",
    "Real-time match tracking",
    "Detailed performance stats",
    "Global leaderboards",
    "Team coordination tools"
];

const CTASection = memo(function CTASection() {
    return (
        <section className="relative py-20 md:py-28 px-4 md:px-20 overflow-hidden">
            <div className="max-w-[1512px] mx-auto relative z-10">
                <motion.div
                    className="bg-[var(--neutral-surface)] border-2 border-[var(--brand-primary)]/30 rounded-2xl p-12 md:p-16 text-center"
                    style={{ boxShadow: "var(--shadow-card)" }}
                    initial={{ opacity: 0, scaleY: 0.9, scaleX: 0.97 }}
                    whileInView={{ opacity: 1, scaleY: 1, scaleX: 1 }}
                    viewport={{ amount: 0.4 }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/20 mb-6">
                        <Crown size={16} className="text-[var(--brand-primary)]" />
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
                                    staggerChildren: 0.1
                                }
                            }
                        }}
                    >
                        {benefits.map(function (benefit, idx) {
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
                        transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
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
    );
});

export default CTASection;
