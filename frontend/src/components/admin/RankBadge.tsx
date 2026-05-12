import { Award } from "lucide-react";
import { RANK_COLOR, RANK_ICON } from "./adminConstants";

export default function RankBadge({ rank }: { rank: string }) {
    const color = RANK_COLOR[rank] ?? "#888";
    const Icon  = RANK_ICON[rank]  ?? Award;
    return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full"
            style={{ color, background: color + "18", border: `1px solid ${color}30` }}>
            <Icon size={10} /> {rank}
        </span>
    );
}
