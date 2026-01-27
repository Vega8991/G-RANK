import { NavLink, Outlet } from "react-router-dom";
import { Crown, Home, Trophy, LayoutDashboard, Shield, User, ChevronDown } from "lucide-react";

export default function AppLayout() {
    let getLinkClass = function (isActive) {
        let baseClass = "flex items-center gap-2 text-sm font-medium transition-colors pb-1 border-b-2";
        let activeClass = "border-[#dc143c] text-white";
        let inactiveClass = "border-transparent text-[#d1d5db] hover:text-white";

        if (isActive) {
            return baseClass + " " + activeClass;
        }
        return baseClass + " " + inactiveClass;
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            {/* Navbar */}
            <nav className="border-b border-[#2a2a2a] sticky top-0 z-50 backdrop-blur-lg bg-[#0a0a0a]/95">
                <div className="max-w-[1512px] mx-auto px-6 md:px-20">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-12">
                            <NavLink to="/" className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded bg-[#dc143c] flex items-center justify-center">
                                    <Crown size={18} className="text-white" />
                                </div>
                                <span className="font-extrabold text-lg">G-RANK</span>
                            </NavLink>
                            
                            <div className="hidden md:flex items-center gap-8">
                                <NavLink to="/" className={function ({ isActive }) { return getLinkClass(isActive); }}>
                                    <Home size={16} /> Home
                                </NavLink>
                                <NavLink to="/tournaments" className={function ({ isActive }) { return getLinkClass(isActive); }}>
                                    <Trophy size={16} /> Tournaments
                                </NavLink>
                                <NavLink to="/leaderboard" className={function ({ isActive }) { return getLinkClass(isActive); }}>
                                    <Crown size={16} /> Leaderboard
                                </NavLink>
                                <NavLink to="/dashboard" className={function ({ isActive }) { return getLinkClass(isActive); }}>
                                    <User size={16} /> Dashboard
                                </NavLink>
                                <NavLink to="/admin" className={function ({ isActive }) { return getLinkClass(isActive); }}>
                                    <Shield size={16} /> Admin
                                </NavLink>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 hover:bg-[#111111] px-3 py-2 rounded-lg transition-colors">
                                <div className="w-8 h-8 bg-[#dc143c] rounded-full flex items-center justify-center">
                                    <User size={16} className="text-white" />
                                </div>
                                <div className="hidden md:block text-left">
                                    <p className="text-sm font-semibold">ProPlayer</p>
                                    <p className="text-xs text-[#dc143c] font-bold">Elite</p>
                                </div>
                                <ChevronDown size={14} className="text-[#d1d5db]" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main>
                <Outlet />
            </main>
        </div>
    );
}
