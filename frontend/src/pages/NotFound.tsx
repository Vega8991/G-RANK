import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { Crown, Home } from "lucide-react";
import Aurora from "../components/ui/Aurora";

export default function NotFound() {
    return (
        <div className="min-h-screen text-white relative flex items-center justify-center px-6">
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <Aurora
                    colorStops={["#ff1a1a", "#0a0000", "#ff3333"]}
                    blend={0.5}
                    amplitude={1.0}
                    speed={0.8}
                />
            </div>

            <motion.div
                className="relative z-10 text-center space-y-6 max-w-md"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
                <div className="w-20 h-20 rounded-2xl bg-[var(--brand-primary)] flex items-center justify-center mx-auto shadow-2xl shadow-[var(--brand-primary)]/40">
                    <Crown size={36} className="text-white" />
                </div>

                <div>
                    <motion.p
                        className="text-8xl font-black tracking-tighter text-[var(--brand-primary)] leading-none"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    >
                        404
                    </motion.p>
                    <h1 className="text-2xl font-extrabold tracking-tight mt-3">Page not found</h1>
                    <p className="text-sm text-[var(--neutral-text-muted)] mt-2 leading-relaxed">
                        Looks like this page doesn't exist or has been moved. Head back to safety.
                    </p>
                </div>

                <NavLink
                    to="/"
                    className="inline-flex items-center gap-2.5 px-6 py-3 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-[var(--brand-primary)]/30"
                >
                    <Home size={16} /> Back to Home
                </NavLink>
            </motion.div>
        </div>
    );
}
