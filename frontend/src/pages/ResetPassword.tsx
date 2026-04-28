import { useState } from "react";
import { NavLink, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Crown, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import Aurora from "../components/ui/Aurora";
import Button from "../components/common/Button";
import { resetPassword } from "../services/authService";
import { AxiosError } from "axios";

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token") ?? "";
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        if (password !== confirm) {
            setError("Passwords do not match.");
            return;
        }
        if (!token) {
            setError("Invalid or missing reset token.");
            return;
        }
        setIsLoading(true);
        try {
            await resetPassword(token, password);
            setDone(true);
            setTimeout(() => navigate("/login"), 3000);
        } catch (err) {
            const axiosErr = err as AxiosError<{ message?: string }>;
            setError(axiosErr.response?.data?.message || "Reset failed. The link may have expired.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen text-white relative flex items-center justify-center px-6 py-10">
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <Aurora
                    colorStops={["#ff1a1a", "#0a0000", "#ff3333"]}
                    blend={0.75}
                    amplitude={1.4}
                    speed={1.3}
                />
            </div>

            <motion.div
                className="w-full max-w-md relative z-10"
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
                <NavLink to="/" className="flex items-center gap-3 mb-10 group w-fit">
                    <div className="w-10 h-10 rounded-lg bg-[var(--brand-primary)] flex items-center justify-center shadow-lg shadow-[var(--brand-primary)]/30">
                        <Crown size={20} className="text-white" />
                    </div>
                    <span className="text-xl font-extrabold tracking-tight">G-RANK</span>
                </NavLink>

                <div className="bg-[var(--neutral-surface)]/40 backdrop-blur-lg border border-[var(--neutral-border)]/40 rounded-2xl p-8 md:p-10">
                    {done ? (
                        <motion.div
                            className="text-center space-y-4"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto">
                                <CheckCircle size={32} className="text-green-400" />
                            </div>
                            <h2 className="text-xl font-extrabold">Password reset!</h2>
                            <p className="text-sm text-[var(--neutral-text-muted)]">
                                Redirecting to sign in...
                            </p>
                        </motion.div>
                    ) : (
                        <>
                            <div className="mb-8">
                                <h1 className="text-2xl font-extrabold tracking-tight mb-2">Reset password</h1>
                                <p className="text-sm text-[var(--neutral-text-muted)]">
                                    Enter your new password below.
                                </p>
                            </div>

                            {error && (
                                <motion.div
                                    className="flex items-center gap-3 bg-[var(--status-danger)]/10 border border-[var(--status-danger)]/30 rounded-xl px-4 py-3 mb-6"
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <AlertCircle size={16} className="text-[var(--status-danger)] flex-shrink-0" />
                                    <p className="text-sm text-[var(--status-danger)]">{error}</p>
                                </motion.div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-[var(--neutral-text-secondary)]">
                                        New password
                                    </label>
                                    <div className="relative">
                                        <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--neutral-text-muted)]" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            minLength={6}
                                            placeholder="Min. 6 characters"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            className="w-full bg-[var(--neutral-bg)]/60 border border-[var(--neutral-border)]/50 rounded-xl pl-11 pr-12 py-3 text-sm text-white placeholder:text-[var(--neutral-text-muted)]/60 outline-none focus:border-[var(--brand-primary)]/60 focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition-all duration-300"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(v => !v)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--neutral-text-muted)] hover:text-white transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-[var(--neutral-text-secondary)]">
                                        Confirm password
                                    </label>
                                    <div className="relative">
                                        <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--neutral-text-muted)]" />
                                        <input
                                            type={showConfirm ? "text" : "password"}
                                            required
                                            placeholder="Repeat new password"
                                            value={confirm}
                                            onChange={e => setConfirm(e.target.value)}
                                            className="w-full bg-[var(--neutral-bg)]/60 border border-[var(--neutral-border)]/50 rounded-xl pl-11 pr-12 py-3 text-sm text-white placeholder:text-[var(--neutral-text-muted)]/60 outline-none focus:border-[var(--brand-primary)]/60 focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition-all duration-300"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirm(v => !v)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--neutral-text-muted)] hover:text-white transition-colors"
                                        >
                                            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className={"w-full py-3.5 text-sm font-bold tracking-wide rounded-xl " + (isLoading ? "opacity-60 pointer-events-none" : "")}
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        "Set new password"
                                    )}
                                </Button>
                            </form>
                        </>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
