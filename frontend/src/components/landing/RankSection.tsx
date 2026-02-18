import { useState, memo } from "react";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import RankCard, { type Rank } from "./RankCard";

interface RankSectionProps {
    ranks: Rank[];
}

const RankSection = memo(function RankSection({ ranks }: RankSectionProps) {
    const [selectedRank, setSelectedRank] = useState<Rank>(ranks[4]);

    const selectedRankIndex = ranks.findIndex(function (rank) {
        return rank.name === selectedRank.name;
    });
    const selectedRankProgress = ((selectedRankIndex + 1) / ranks.length) * 100;

    return (
        <section className="py-20 md:py-28 px-4 md:px-20 bg-[var(--neutral-surface)]">
            <div className="max-w-[1512px] mx-auto">
                <motion.div
                    className="text-center mb-16 space-y-4"
                    initial={{ opacity: 0, y: 40, scaleY: 0.9 }}
                    whileInView={{ opacity: 1, y: 0, scaleY: 1 }}
                    style={{ originY: 0 }}
                    viewport={{ amount: 0.4 }}
                    transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/20">
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
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                >
                    {ranks.map(function (rank) {
                        return (
                            <RankCard
                                key={rank.name}
                                rank={rank}
                                isSelected={selectedRank.name === rank.name}
                                onSelect={() => setSelectedRank(rank)}
                            />
                        );
                    })}
                </motion.div>

                <motion.div
                    className="bg-[var(--neutral-bg)] border border-[var(--neutral-border)] rounded-xl p-8 max-w-3xl mx-auto transition-transform duration-500 hover:-translate-y-1 hover:shadow-xl"
                    initial={{ opacity: 0, y: 40, scaleY: 0.9 }}
                    whileInView={{ opacity: 1, y: 0, scaleY: 1 }}
                    style={{ originY: 0 }}
                    viewport={{ amount: 0.4 }}
                    transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
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
    );
});

export default RankSection;
