import { memo } from "react";
import type { LucideIcon } from "lucide-react";

export interface Rank {
    name: string;
    mmr: string;
    color: string;
    icon: LucideIcon;
}

interface RankCardProps {
    rank: Rank;
    isSelected: boolean;
    onSelect: () => void;
}

const RankCard = memo(function RankCard({ rank, isSelected, onSelect }: RankCardProps) {
    const RankIcon = rank.icon;

    return (
        <div
            onClick={onSelect}
            className={
                "group bg-[var(--neutral-bg)]/60 backdrop-blur-md rounded-xl p-6 text-center cursor-pointer transition-all duration-500 ease-out shadow-md hover:shadow-xl " +
                (isSelected
                    ? "border-2 border-[var(--brand-primary)] shadow-2xl shadow-[var(--brand-primary)]/20 -translate-y-2 ring-4 ring-[var(--brand-primary)]/20 scale-105"
                    : "border border-[var(--neutral-border)]/40 hover:border-[var(--brand-primary)]/50 hover:-translate-y-2 hover:scale-102")
            }
        >
            <div className="relative w-14 h-14 mx-auto mb-4">
                <div
                    className={
                        "absolute inset-0 rounded-xl border border-dashed opacity-30 group-hover:opacity-70 group-hover:rotate-180 transition-all duration-700 " +
                        (isSelected ? "border-[var(--brand-primary)] opacity-70 rotate-90" : "border-[var(--neutral-border)]")
                    }
                ></div>
                <div
                    className="relative w-full h-full rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg"
                    style={{ 
                        background: `linear-gradient(135deg, ${rank.color}30, ${rank.color}10)`,
                        boxShadow: isSelected ? `0 4px 20px ${rank.color}40` : 'none'
                    }}
                >
                    <RankIcon size={26} style={{ color: rank.color }} />
                </div>
            </div>
            <p className="text-sm font-bold mb-2 transition-colors duration-300 group-hover:text-white">{rank.name}</p>
            <p className="text-xs text-[var(--neutral-text-muted)] transition-colors duration-300 group-hover:text-[var(--neutral-text-secondary)]">{rank.mmr}</p>
        </div>
    );
});

export default RankCard;
