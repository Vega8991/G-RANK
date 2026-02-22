import { NavLink } from "react-router-dom";

export default function Footer() {
    return (
        <footer className="border-t border-[var(--neutral-border)] bg-[var(--neutral-surface)]">
            <div className="max-w-[1512px] mx-auto px-6 md:px-20 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded bg-[var(--brand-primary)] flex items-center justify-center">
                                <span className="text-white font-extrabold text-sm">G</span>
                            </div>
                            <span className="font-extrabold text-lg">G-RANK</span>
                        </div>
                        <p className="text-sm text-[var(--neutral-text-secondary)] max-w-xs">
                            Pro esports platform with MMR-based matchmaking and competitive lobbies.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold text-sm mb-4">GAMES</h4>
                        <div className="space-y-2">
                            <NavLink to="/" className="block text-sm text-[var(--neutral-text-secondary)] hover:text-white transition-colors">
                                Rocket League
                            </NavLink>
                            <NavLink to="/" className="block text-sm text-[var(--neutral-text-secondary)] hover:text-white transition-colors">
                                League of Legends
                            </NavLink>
                            <NavLink to="/" className="block text-sm text-[var(--neutral-text-secondary)] hover:text-white transition-colors">
                                Valorant
                            </NavLink>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-sm mb-4">TIERS</h4>
                        <div className="space-y-2">
                            <NavLink to="/" className="block text-sm text-[var(--neutral-text-secondary)] hover:text-white transition-colors">
                                Bronze & Silver
                            </NavLink>
                            <NavLink to="/" className="block text-sm text-[var(--neutral-text-secondary)] hover:text-white transition-colors">
                                Gold & Platinum
                            </NavLink>
                            <NavLink to="/" className="block text-sm text-[var(--neutral-text-secondary)] hover:text-white transition-colors">
                                Master & Elite
                            </NavLink>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-[var(--neutral-border)] flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-[var(--neutral-text-muted)]">© 2025 G-RANK. All rights reserved.</p>
                    <div className="flex gap-6">
                        <NavLink to="/" className="text-xs text-[var(--neutral-text-secondary)] hover:text-white transition-colors">
                            Privacy Policy
                        </NavLink>
                        <NavLink to="/" className="text-xs text-[var(--neutral-text-secondary)] hover:text-white transition-colors">
                            Terms of Service
                        </NavLink>
                        <NavLink to="/" className="text-xs text-[var(--neutral-text-secondary)] hover:text-white transition-colors">
                            Contact Us
                        </NavLink>
                    </div>
                </div>
            </div>
        </footer>
    );
}
