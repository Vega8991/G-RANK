import { useState, useEffect, memo } from "react";
import { motion } from "framer-motion";
import FeatureCard from "./FeatureCard";

const FeatureSpotlight = memo(function FeatureSpotlight({ features, featureIndex, onFeatureSelect }) {
    return (
        <div className="max-w-3xl mx-auto">
            <motion.div
                className="bg-[var(--neutral-surface)]/80 border border-[var(--neutral-border)] rounded-2xl p-6 md:p-8 backdrop-blur-sm overflow-hidden"
                initial={{ opacity: 0, y: 40, scaleY: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scaleY: 1 }}
                style={{ originY: 0 }}
                viewport={{ amount: 0.4 }}
                transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
                <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold tracking-wider text-[var(--brand-primary)]">
                        FEATURE SPOTLIGHT
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--neutral-text-muted)]">
                        Auto-rotating
                    </span>
                </div>
                <div className="relative h-32 md:h-24 overflow-hidden">
                    <div
                        className="absolute inset-0 flex items-center gap-4 transition-transform duration-500 ease-out"
                        style={{
                            transform: "translate3d(0, 0, 0)"
                        }}
                    >
                        <div 
                            className="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center flex-shrink-0" 
                            style={{ 
                                background: `linear-gradient(135deg, ${features[featureIndex].color}20, ${features[featureIndex].color}05)` 
                            }}
                        >
                            {(() => {
                                const IconComponent = features[featureIndex].icon;
                                return (
                                    <IconComponent
                                        size={28}
                                        style={{ color: features[featureIndex].color }}
                                    />
                                );
                            })()}
                        </div>
                        <div className="text-left">
                            <h3 className="text-lg md:text-xl font-bold mb-1">
                                {features[featureIndex].title}
                            </h3>
                            <p className="text-xs md:text-sm text-[var(--neutral-text-secondary)] leading-relaxed">
                                {features[featureIndex].desc}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2 mt-4 justify-center">
                    {features.map(function (_feature, idx) {
                        const isActive = idx === featureIndex;
                        return (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => onFeatureSelect(idx)}
                                className={
                                    "h-1.5 rounded-full transition-all duration-300 " +
                                    (isActive
                                        ? "w-6 bg-[var(--brand-primary)]"
                                        : "w-2 bg-[var(--neutral-border)] hover:bg-[var(--neutral-text-secondary)]")
                                }
                            />
                        );
                    })}
                </div>
            </motion.div>
        </div>
    );
});

const FeaturesSection = memo(function FeaturesSection({ features }) {
    const [featureIndex, setFeatureIndex] = useState(0);

    useEffect(function () {
        if (features.length <= 1) {
            return;
        }

        const interval = setInterval(function () {
            setFeatureIndex(function (prev) {
                return (prev + 1) % features.length;
            });
        }, 4500);

        return function () {
            clearInterval(interval);
        };
    }, [features.length]);

    return (
        <section className="py-20 md:py-28 px-4 md:px-20">
            <div className="max-w-[1512px] mx-auto">
                <motion.div
                    className="text-center mb-16 space-y-4"
                    initial={{ opacity: 0, y: 40, scaleY: 0.9 }}
                    whileInView={{ opacity: 1, y: 0, scaleY: 1 }}
                    style={{ originY: 0 }}
                    viewport={{ amount: 0.4 }}
                    transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
                >
                    <h2 className="text-4xl md:text-5xl font-extrabold">
                        EVERYTHING YOU NEED TO <span className="text-[var(--brand-primary)]">COMPETE</span>
                    </h2>
                    <p className="text-xl text-[var(--neutral-text-secondary)] max-w-2xl mx-auto leading-relaxed">
                        Professional-grade tools and features designed for competitive esports excellence.
                    </p>
                </motion.div>

                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ amount: 0.2 }}
                    variants={{
                        hidden: {},
                        visible: {
                            transition: {
                                staggerChildren: 0.12
                            }
                        }
                    }}
                >
                    {features.map(function (feature, idx) {
                        return <FeatureCard key={idx} feature={feature} index={idx} />;
                    })}
                </motion.div>

                <FeatureSpotlight 
                    features={features} 
                    featureIndex={featureIndex}
                    onFeatureSelect={setFeatureIndex}
                />
            </div>
        </section>
    );
});

export default FeaturesSection;
