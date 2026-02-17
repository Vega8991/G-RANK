import { motion } from "framer-motion";
import { Trophy, Gamepad2, Joystick, Rocket, Crosshair } from "lucide-react";

let items = [
    { label: "Rocket League", icon: Rocket },
    { label: "League of Legends", icon: Gamepad2 },
    { label: "Valorant", icon: Crosshair },
    { label: "Pokemon Showdown", icon: Trophy },
    { label: "Clutch Plays", icon: Joystick }
];

export default function SponsorsMarquee() {
    let sequence = items.concat(items);

    return (
        <div className="border-y border-[var(--neutral-border)] bg-[var(--neutral-bg)]/70 backdrop-blur-sm">
            <div className="max-w-[1512px] mx-auto px-4 md:px-20 py-4 flex items-center gap-4 overflow-hidden">
                <span className="text-[10px] md:text-xs font-semibold tracking-[0.3em] text-[var(--neutral-text-muted)] uppercase">
                    FEATURED QUEUES
                </span>
                <motion.div
                    className="relative flex-1 overflow-hidden"
                    initial={{ x: 0 }}
                >
                    <motion.div
                        className="flex gap-8 whitespace-nowrap"
                        animate={{ x: ["0%", "-50%"] }}
                        transition={{
                            duration: 22,
                            ease: "linear",
                            repeat: Infinity
                        }}
                    >
                        {sequence.map(function (item, idx) {
                            let Icon = item.icon;
                            return (
                                <div
                                    key={idx}
                                    className="inline-flex items-center gap-2 text-xs md:text-sm text-[var(--neutral-text-secondary)] px-3 py-1 rounded-full border border-[var(--neutral-border)] bg-[var(--neutral-surface)]/70"
                                >
                                    <Icon size={14} className="text-[var(--brand-primary)]" />
                                    <span>{item.label}</span>
                                </div>
                            );
                        })}
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}

