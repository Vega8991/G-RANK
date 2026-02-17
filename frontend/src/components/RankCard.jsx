import { memo } from "react";

const RankCard = memo(function RankCard({ rank, isSelected, onSelect }) {
    const RankIcon = rank.icon;

    return (
        <div
            onClick={onSelect}
            className={
                "group bg-[var(--neutral-bg)] rounded-xl p-6 text-center cursor-pointer transition-all duration-300 ease-out " +
                (isSelected
                    ? "border-[var(--brand-primary)] shadow-lg -translate-y-2 ring-2 ring-[var(--brand-primary)]/40"
                    : "border border-[var(--neutral-border)] hover:border-[var(--neutral-border)] hover:-translate-y-1 hover:shadow-lg")
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
});

export default RankCard;
