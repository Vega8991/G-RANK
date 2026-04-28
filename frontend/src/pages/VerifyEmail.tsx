import { useEffect, useState } from "react";
import { NavLink, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Crown, CheckCircle, XCircle, Loader } from "lucide-react";
import Aurora from "../components/ui/Aurora";
import axios from "axios";
import { API_URL } from "../config/api";

type Status = "loading" | "success" | "error";

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token") ?? "";
    const [status, setStatus] = useState<Status>("loading");
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setMessage("Missing verification token.");
            return;
        }
        axios.get(`${API_URL}/auth/verify-email?token=${token}`)
            .then(res => {
                setMessage(res.data.message || "Email verified successfully!");
                setStatus("success");
            })
            .catch(err => {
                setMessage(err.response?.data?.message || "Invalid or expired token.");
                setStatus("error");
            });
    }, [token]);

    return (
        <div className="min-h-screen text-white relative flex items-center justify-center px-6">
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <Aurora
                    colorStops={["#ff1a1a", "#0a0000", "#ff3333"]}
                    blend={0.75}
                    amplitude={1.4}
                    speed={1.3}
                />
            </div>

            <motion.div
                className="relative z-10 w-full max-w-md"
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
                <NavLink to="/" className="flex items-center gap-3 mb-10 w-fit">
                    <div className="w-10 h-10 rounded-lg bg-[var(--brand-primary)] flex items-center justify-center shadow-lg shadow-[var(--brand-primary)]/30">
                        <Crown size={20} className="text-white" />
                    </div>
                    <span className="text-xl font-extrabold tracking-tight">G-RANK</span>
                </NavLink>

                <div className="bg-[var(--neutral-surface)]/40 backdrop-blur-lg border border-[var(--neutral-border)]/40 rounded-2xl p-10 text-center space-y-5">
                    {status === "loading" && (
                        <>
                            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
                                <Loader size={28} className="text-[var(--neutral-text-muted)] animate-spin" />
                            </div>
                            <h2 className="text-xl font-extrabold">Verifying email...</h2>
                            <p className="text-sm text-[var(--neutral-text-muted)]">Just a moment.</p>
                        </>
                    )}

                    {status === "success" && (
                        <motion.div className="space-y-4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                            <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto">
                                <CheckCircle size={32} className="text-green-400" />
                            </div>
                            <h2 className="text-xl font-extrabold">Email verified!</h2>
                            <p className="text-sm text-[var(--neutral-text-muted)]">{message}</p>
                            <NavLink
                                to="/login"
                                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white text-sm font-bold rounded-xl transition-colors"
                            >
                                Sign in
                            </NavLink>
                        </motion.div>
                    )}

                    {status === "error" && (
                        <motion.div className="space-y-4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto">
                                <XCircle size={32} className="text-red-400" />
                            </div>
                            <h2 className="text-xl font-extrabold">Verification failed</h2>
                            <p className="text-sm text-[var(--neutral-text-muted)]">{message}</p>
                            <NavLink
                                to="/login"
                                className="inline-flex items-center gap-2 px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white text-sm font-bold rounded-xl transition-colors border border-white/10"
                            >
                                Back to sign in
                            </NavLink>
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
