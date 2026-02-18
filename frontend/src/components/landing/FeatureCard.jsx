import { memo } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const FeatureCard = memo(function FeatureCard({ feature, index }) {
    const IconComponent = feature.icon;

    return (
        <motion.div
            className="group bg-[var(--neutral-surface)]/40 backdrop-blur-lg border border-[var(--neutral-border)]/40 rounded-xl p-8 hover:border-[var(--brand-primary)]/30 hover:-translate-y-3 hover:shadow-2xl shadow-lg transition-all duration-500 ease-out hover:bg-[var(--neutral-surface)]/50"
            variants={{
                hidden: { opacity: 0, y: 40 },
                visible: { opacity: 1, y: 0 }
            }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
            <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-md group-hover:shadow-lg"
                style={{
                    background: `linear-gradient(135deg, ${feature.color}30, ${feature.color}10)`
                }}
            >
                <IconComponent size={28} style={{ color: feature.color }} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-[var(--neutral-text)] group-hover:text-white transition-colors duration-300">{feature.title}</h3>
            <p className="text-sm text-[var(--neutral-text-secondary)] leading-relaxed mb-6 group-hover:text-[var(--neutral-text)] transition-colors duration-300">
                {feature.desc}
            </p>
            <button
                className="flex items-center gap-2 text-sm font-semibold group-hover:gap-4 transition-all duration-300 group-hover:translate-x-1"
                style={{ color: feature.color }}
            >
                Learn more <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
            </button>
        </motion.div>
    );
});

export default FeatureCard;
