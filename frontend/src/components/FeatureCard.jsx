import { memo } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const FeatureCard = memo(function FeatureCard({ feature, index }) {
    const IconComponent = feature.icon;

    return (
        <motion.div
            className="group bg-[var(--neutral-surface)] border border-[var(--neutral-border)] rounded-xl p-8 hover:border-[var(--neutral-border)] hover:-translate-y-2 hover:shadow-xl transition-all duration-300 ease-out"
            variants={{
                hidden: { opacity: 0, y: 40 },
                visible: { opacity: 1, y: 0 }
            }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
            <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"
                style={{
                    background: `linear-gradient(135deg, ${feature.color}20, ${feature.color}05)`
                }}
            >
                <IconComponent size={28} style={{ color: feature.color }} />
            </div>
            <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
            <p className="text-sm text-[var(--neutral-text-secondary)] leading-relaxed mb-4">
                {feature.desc}
            </p>
            <button
                className="flex items-center gap-2 text-sm font-semibold group-hover:gap-3 transition-all duration-300"
                style={{ color: feature.color }}
            >
                Learn more <ArrowRight size={16} />
            </button>
        </motion.div>
    );
});

export default FeatureCard;
