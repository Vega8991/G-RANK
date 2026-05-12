import { STATUS_COLOR, USER_STATUS_COLOR } from "./adminConstants";

interface StatusBadgeProps {
    status: string;
    type?: "lobby" | "user";
}

export default function StatusBadge({ status, type = "lobby" }: StatusBadgeProps) {
    const cfg = type === "user"
        ? (USER_STATUS_COLOR[status] ?? { text: "text-white/40", bg: "rgba(255,255,255,0.05)" })
        : (STATUS_COLOR[status]      ?? { text: "text-white/40", bg: "rgba(255,255,255,0.05)", dot: "bg-white/20" });
    const dot = type === "lobby" ? (STATUS_COLOR[status]?.dot ?? "bg-white/20") : null;
    return (
        <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full capitalize ${cfg.text}`}
            style={{ background: cfg.bg }}>
            {dot && <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />}
            {status.replace("_", " ")}
        </span>
    );
}
