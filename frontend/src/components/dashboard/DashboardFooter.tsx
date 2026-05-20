import { NavLink } from "react-router-dom";

export default function DashboardFooter() {
    return (
        <footer style={{ borderTop: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.3)", backdropFilter: "blur(20px)" }}>
            <div className="max-w-[1512px] mx-auto px-4 md:px-20 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-[var(--brand-primary)] flex items-center justify-center">
                                <span className="text-white font-black text-sm">G</span>
                            </div>
                            <span className="font-black text-lg">G-RANK</span>
                        </div>
                        <p className="text-sm text-white/30 max-w-xs leading-relaxed">
                            Elite esports tournament platform with MMR-based competitive ranking.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold text-xs mb-4 text-white/30 tracking-widest uppercase">Games</h4>
                        <div className="space-y-3">
                            {["Fortnite", "Rocket League", "Valorant"].map(g => (
                                <NavLink key={g} to="/lobbies" className="block text-sm text-white/30 hover:text-white transition-colors duration-300">{g}</NavLink>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="font-bold text-xs mb-4 text-white/30 tracking-widest uppercase">Tiers</h4>
                        <div className="space-y-3">
                            {["Bronze → Silver → Gold", "Platinum → Diamond", "Master → Elite"].map(t => (
                                <NavLink key={t} to="/leaderboard" className="block text-sm text-white/30 hover:text-white transition-colors duration-300">{t}</NavLink>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="pt-8 flex justify-between items-center" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    <p className="text-xs text-white/20">© 2025 G-RANK. ALL RIGHTS RESERVED.</p>
                </div>
            </div>
        </footer>
    );
}
