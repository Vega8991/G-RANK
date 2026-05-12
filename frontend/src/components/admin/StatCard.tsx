import { motion } from "framer-motion";
import type { Users } from "lucide-react";

interface StatCardProps {
    label: string;
    value: number;
    icon: typeof Users;
    color: string;
    bg: string;
}

export default function StatCard({ label, value, icon: Icon, color, bg }: StatCardProps) {
    return (
        <motion.div
            className="group relative rounded-2xl overflow-hidden"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -3, boxShadow: `0 20px 50px ${bg}` }}
        >
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg,transparent,${color}80,transparent)` }} />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `radial-gradient(circle at 50% 0%,${bg} 0%,transparent 70%)` }} />
            <div className="relative p-5 border border-white/5 backdrop-blur-xl h-full"
                style={{ background: "linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))" }}>
                <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/30">{label}</p>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                        style={{ backgroundColor: bg, border: `1px solid ${color}30` }}>
                        <Icon size={17} style={{ color }} />
                    </div>
                </div>
                <p className="text-4xl font-black tabular-nums" style={{ color }}>{value.toLocaleString()}</p>
            </div>
        </motion.div>
    );
}
