import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
    label: string;
    value: number;
    icon: LucideIcon;
    color: string;
    bg: string;
    suffix?: string;
    delay?: number;
    decimals?: number;
}

function useCountUp(target: number, duration = 1100, delay = 0): number {
    const [count, setCount] = useState(0);
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        const timeout = setTimeout(function () {
            const startTime = performance.now();
            function tick(now: number) {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                setCount(Math.round(target * eased));
                if (progress < 1) {
                    rafRef.current = requestAnimationFrame(tick);
                }
            }
            rafRef.current = requestAnimationFrame(tick);
        }, delay);
        return function () {
            clearTimeout(timeout);
            if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
        };
    }, [target, duration, delay]);

    return count;
}

export default function StatCard({ label, value, icon: Icon, color, bg, suffix = "", delay = 0, decimals = 0 }: StatCardProps) {
    const count = useCountUp(value, 1100, delay);
    const display = decimals > 0 ? count.toFixed(decimals) : count.toLocaleString();

    return (
        <motion.div
            className="group relative rounded-2xl overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 + delay / 1000, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -4, boxShadow: `0 24px 60px ${bg}` }}
        >
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${color}80, transparent)` }} />
            <div
                className="relative p-6 h-full border border-white/5 backdrop-blur-xl"
                style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)" }}
            >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `radial-gradient(circle at 50% 0%, ${bg} 0%, transparent 70%)` }} />
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-5">
                        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/30">{label}</p>
                        <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                            style={{ backgroundColor: bg, border: `1px solid ${color}30` }}
                        >
                            <Icon size={17} style={{ color }} />
                        </div>
                    </div>
                    <p className="text-4xl font-black tabular-nums tracking-tight" style={{ color }}>
                        {display}{suffix}
                    </p>
                </div>
            </div>
        </motion.div>
    );
}
