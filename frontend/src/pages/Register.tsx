import { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { register } from "../services/authService";
import { AxiosError } from "axios";
import Button from "../components/common/Button";
import Aurora from "../components/ui/Aurora";
import { Crown, User, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, Trophy, Target, TrendingUp } from "lucide-react";

export default function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [message, setMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setMessage("");

        if (password !== confirmPassword) {
            setMessage("Passwords do not match.");
            return;
        }

        if (!agreeTerms) {
            setMessage("You must agree to the Terms and Privacy Policy.");
            return;
        }

        setIsLoading(true);
        try {
            const response = await register(username, email, password);
            setIsSuccess(true);
            setMessage((response as { message?: string }).message || "Account created successfully!");
            setTimeout(function () {
                navigate("/login");
            }, 2000);
        } catch (err) {
            const axiosErr = err as AxiosError<{ message?: string }>;
            setIsSuccess(false);
            setMessage(axiosErr.response?.data?.message || "Registration failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    const features = [
        { icon: Trophy, text: "Compete in exclusive tournaments" },
        { icon: Target, text: "Fair MMR-based matchmaking system" },
        { icon: TrendingUp, text: "Track your progress and statistics" },
    ];

    return (
        <div className="min-h-screen text-white relative flex">
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <Aurora
                    colorStops={["#ff1a1a", "#0a0000", "#ff3333"]}
                    blend={0.75}
                    amplitude={1.4}
                    speed={1.3}
                />
            </div>

            <motion.div
                className="hidden lg:flex flex-col justify-between w-1/2 relative px-12 xl:px-16 py-10 overflow-hidden"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
                <div
                    className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
                    style={{
                        background: "linear-gradient(90deg, transparent, rgba(220,20,60,0.15) 50%, transparent)",
                    }}
                />

                <div className="relative z-10"></div>

                <div className="relative z-10 space-y-8 -mt-20">
                    <motion.h1
                        className="text-4xl xl:text-5xl font-extrabold leading-[1.15] tracking-tight"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    >
                        Join the elite<br />competitive platform
                    </motion.h1>
                    <motion.p
                        className="text-[var(--neutral-text-secondary)] text-base xl:text-lg leading-relaxed max-w-md"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    >
                        Climb the ranks, compete in tournaments, and prove your dominance against the best players worldwide.
                    </motion.p>

                    <motion.div
                        className="space-y-4 pt-2"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    >
                        {features.map(function (feature, idx) {
                            const Icon = feature.icon;
                            return (
                                <div key={idx} className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/20 flex items-center justify-center flex-shrink-0">
                                        <Icon size={18} className="text-[var(--brand-primary)]" />
                                    </div>
                                    <span className="text-sm text-[var(--neutral-text-secondary)]">{feature.text}</span>
                                </div>
                            );
                        })}
                    </motion.div>
                </div>

                <p className="relative z-10 text-xs text-[var(--neutral-text-muted)]">
                    &copy; {new Date().getFullYear()} G-Rank. Competitive esports platform.
                </p>
            </motion.div>

            <div className="hidden lg:block w-px bg-[var(--neutral-border)]/30 self-stretch" />

            <div className="flex-1 flex items-center justify-center px-6 py-10 relative">
                <motion.div
                    className="w-full max-w-md relative z-10"
                    initial={{ opacity: 0, y: 25 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                >
                    <NavLink to="/" className="lg:hidden flex items-center gap-3 mb-10 group">
                        <div className="w-10 h-10 rounded-lg bg-[var(--brand-primary)] flex items-center justify-center shadow-lg shadow-[var(--brand-primary)]/30">
                            <Crown size={20} className="text-white" />
                        </div>
                        <span className="text-xl font-extrabold tracking-tight">G-RANK</span>
                    </NavLink>

                    <div className="bg-[var(--neutral-surface)]/40 backdrop-blur-lg border border-[var(--neutral-border)]/40 rounded-2xl p-8 md:p-10">
                        <div className="mb-8">
                            <h1 className="text-2xl font-extrabold tracking-tight mb-2">Create account</h1>
                            <p className="text-sm text-[var(--neutral-text-muted)]">
                                Join tournaments and start climbing the ranks.
                            </p>
                        </div>

                        {message && (
                            <motion.div
                                className={
                                    "flex items-center gap-3 rounded-xl px-4 py-3 mb-6 border " +
                                    (isSuccess
                                        ? "bg-[var(--status-success)]/10 border-[var(--status-success)]/30"
                                        : "bg-[var(--status-danger)]/10 border-[var(--status-danger)]/30")
                                }
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                {isSuccess ? (
                                    <CheckCircle2 size={16} className="text-[var(--status-success)] flex-shrink-0" />
                                ) : (
                                    <AlertCircle size={16} className="text-[var(--status-danger)] flex-shrink-0" />
                                )}
                                <p className={"text-sm " + (isSuccess ? "text-[var(--status-success)]" : "text-[var(--status-danger)]")}>
                                    {message}
                                </p>
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-1.5">
                                <label htmlFor="username" className="block text-sm font-medium text-[var(--neutral-text-secondary)]">
                                    Username
                                </label>
                                <input
                                    id="username"
                                    type="text"
                                    required
                                    placeholder="Choose a username"
                                    value={username}
                                    onChange={function (e) { setUsername(e.target.value); }}
                                    className="w-full bg-[var(--neutral-bg)]/60 border border-[var(--neutral-border)]/50 rounded-xl px-4 py-3 text-sm text-white placeholder:text-[var(--neutral-text-muted)]/60 outline-none focus:border-[var(--brand-primary)]/60 focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition-all duration-300"
                                />
                                <p className="text-xs text-[var(--neutral-text-muted)]">Minimum 3 characters</p>
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor="email" className="block text-sm font-medium text-[var(--neutral-text-secondary)]">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={function (e) { setEmail(e.target.value); }}
                                    className="w-full bg-[var(--neutral-bg)]/60 border border-[var(--neutral-border)]/50 rounded-xl px-4 py-3 text-sm text-white placeholder:text-[var(--neutral-text-muted)]/60 outline-none focus:border-[var(--brand-primary)]/60 focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition-all duration-300"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor="password" className="block text-sm font-medium text-[var(--neutral-text-secondary)]">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        placeholder="Create a strong password"
                                        value={password}
                                        onChange={function (e) { setPassword(e.target.value); }}
                                        className="w-full bg-[var(--neutral-bg)]/60 border border-[var(--neutral-border)]/50 rounded-xl px-4 pr-12 py-3 text-sm text-white placeholder:text-[var(--neutral-text-muted)]/60 outline-none focus:border-[var(--brand-primary)]/60 focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition-all duration-300"
                                    />
                                    <button
                                        type="button"
                                        onClick={function () { setShowPassword(!showPassword); }}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--neutral-text-muted)] hover:text-white transition-colors duration-300"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                <p className="text-xs text-[var(--neutral-text-muted)]">Minimum 8 characters</p>
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-[var(--neutral-text-secondary)]">
                                    Confirm password
                                </label>
                                <div className="relative">
                                    <input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        required
                                        placeholder="Re-enter your password"
                                        value={confirmPassword}
                                        onChange={function (e) { setConfirmPassword(e.target.value); }}
                                        className="w-full bg-[var(--neutral-bg)]/60 border border-[var(--neutral-border)]/50 rounded-xl px-4 pr-12 py-3 text-sm text-white placeholder:text-[var(--neutral-text-muted)]/60 outline-none focus:border-[var(--brand-primary)]/60 focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition-all duration-300"
                                    />
                                    <button
                                        type="button"
                                        onClick={function () { setShowConfirmPassword(!showConfirmPassword); }}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--neutral-text-muted)] hover:text-white transition-colors duration-300"
                                    >
                                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <label className="flex items-start gap-2.5 cursor-pointer group pt-1">
                                <div className="relative mt-0.5">
                                    <input
                                        type="checkbox"
                                        checked={agreeTerms}
                                        onChange={function (e) { setAgreeTerms(e.target.checked); }}
                                        className="sr-only peer"
                                    />
                                    <div className="w-4 h-4 rounded border border-[var(--neutral-border)]/60 bg-[var(--neutral-bg)]/40 peer-checked:bg-[var(--brand-primary)] peer-checked:border-[var(--brand-primary)] transition-all duration-200 flex items-center justify-center">
                                        {agreeTerms && (
                                            <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none">
                                                <path d="M2 6l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                                <span className="text-sm text-[var(--neutral-text-muted)] leading-tight">
                                    I agree to the{" "}
                                    <span className="font-medium text-[var(--brand-primary)] hover:text-[var(--brand-primary-hover)] transition-colors cursor-pointer">Terms</span>
                                    {" "}and{" "}
                                    <span className="font-medium text-[var(--brand-primary)] hover:text-[var(--brand-primary-hover)] transition-colors cursor-pointer">Privacy Policy</span>
                                </span>
                            </label>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className={"w-full py-3.5 text-sm font-bold tracking-wide rounded-xl " + (isLoading ? "opacity-60 pointer-events-none" : "")}
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    "Create account"
                                )}
                            </Button>
                        </form>

                        <div className="flex items-center gap-4 my-7">
                            <div className="flex-1 h-px bg-[var(--neutral-border)]/40" />
                            <span className="text-xs text-[var(--neutral-text-muted)]">OR</span>
                            <div className="flex-1 h-px bg-[var(--neutral-border)]/40" />
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            className="w-full py-3.5 text-sm font-semibold rounded-xl"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Sign up with Google
                        </Button>

                        <p className="text-center text-sm text-[var(--neutral-text-muted)] mt-8">
                            Already have an account?{" "}
                            <NavLink to="/login" className="font-semibold text-[var(--brand-primary)] hover:text-[var(--brand-primary-hover)] transition-colors duration-300">
                                Sign in
                            </NavLink>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
