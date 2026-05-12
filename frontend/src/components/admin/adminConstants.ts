import { Award, Star, Trophy, Gem, Crown, Flame, Swords, Crosshair, Zap } from "lucide-react";

export const RANKS = ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master", "Elite"] as const;

export const RANK_COLOR: Record<string, string> = {
    Bronze: "#cd7f32", Silver: "#c0c0c0", Gold: "#ffd700",
    Platinum: "#e5e4e2", Diamond: "#b9f2ff", Master: "#9b30ff", Elite: "#dc143c",
};

export const RANK_ICON: Record<string, typeof Award> = {
    Bronze: Award, Silver: Star, Gold: Trophy,
    Platinum: Gem, Diamond: Gem, Master: Crown, Elite: Flame,
};

export const LOBBY_STATUS = ["open", "pending", "in_progress", "completed", "cancelled"] as const;

export const STATUS_COLOR: Record<string, { text: string; bg: string; dot: string }> = {
    open:        { text: "text-emerald-400",  bg: "rgba(34,197,94,0.12)",   dot: "bg-emerald-400"  },
    pending:     { text: "text-amber-400",    bg: "rgba(245,158,11,0.12)",  dot: "bg-amber-400"    },
    in_progress: { text: "text-blue-400",     bg: "rgba(59,130,246,0.12)",  dot: "bg-blue-400"     },
    completed:   { text: "text-white/40",     bg: "rgba(255,255,255,0.04)", dot: "bg-white/30"     },
    cancelled:   { text: "text-red-400",      bg: "rgba(239,68,68,0.12)",   dot: "bg-red-400"      },
};

export const USER_STATUS_COLOR: Record<string, { text: string; bg: string }> = {
    active:    { text: "text-emerald-400", bg: "rgba(34,197,94,0.12)"  },
    suspended: { text: "text-red-400",     bg: "rgba(239,68,68,0.12)"  },
    banned:    { text: "text-red-600",     bg: "rgba(185,28,28,0.15)"  },
};

export const GAME_CONFIG: Record<string, { label: string; color: string; Icon: typeof Swords }> = {
    league_of_legends: { label: "League of Legends", color: "#3B82F6", Icon: Swords    },
    valorant:          { label: "Valorant",           color: "#FF4655", Icon: Crosshair },
    pokemon_showdown:  { label: "Pokémon Showdown",   color: "#dc143c", Icon: Zap       },
};
