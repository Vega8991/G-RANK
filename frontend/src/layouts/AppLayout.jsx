import { NavLink, Outlet } from "react-router-dom";
import { Crown, Home, Trophy, LayoutDashboard, Shield, User, ChevronDown } from "lucide-react";

export default function AppLayout() {
    let getLinkClass = function (isActive) {
        let baseClass = "flex items-center gap-2 text-sm font-medium transition pb-2 border-b-2";
        let activeClass = "border-brand-primary text-neutral-text-primary";
        let inactiveClass = "border-transparent text-neutral-text-secondary hover:text-neutral-text-primary";

        if (isActive) {
            return baseClass + " " + activeClass;
        }
        return baseClass + " " + inactiveClass;
    };

    return (
        <div className="min-h-screen bg-neutral-bg text-neutral-text-primary">
            <div className="sticky top-0 z-50 border-b border-neutral-border bg-neutral-bg">
                <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">

                    <div className="flex items-center gap-12">
                        <div className="flex items-center gap-2">
                            <Crown size={24} className="text-brand-primary" />
                            <span className="text-lg font-bold">G-RANK</span>
                        </div>

                        <nav className="flex items-center gap-8">
                            <NavLink to="/" className={function ({ isActive }) { return getLinkClass(isActive); }}>
                                <Home size={18} /> Home
                            </NavLink>

                            <NavLink to="/tournaments" className={function ({ isActive }) { return getLinkClass(isActive); }}>
                                <Trophy size={18} /> Tournaments
                            </NavLink>

                            <NavLink to="/leaderboard" className={function ({ isActive }) { return getLinkClass(isActive); }}>
                                <Crown size={18} /> Leaderboard
                            </NavLink>

                            <NavLink to="/dashboard" className={function ({ isActive }) { return getLinkClass(isActive); }}>
                                <LayoutDashboard size={18} /> Dashboard
                            </NavLink>

                            <NavLink to="/admin" className={function ({ isActive }) { return getLinkClass(isActive); }}>
                                <Shield size={18} /> Admin
                            </NavLink>
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="flex items-center gap-2 hover:bg-neutral-surface p-2 rounded-md transition">
                            <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center">
                                <User size={18} className="text-white" />
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-semibold">ProPlayer</p>
                                <p className="text-xs text-brand-primary font-bold">Elite</p>
                            </div>
                            <ChevronDown size={16} />
                        </button>
                    </div>
                </div>
            </div>

            <main>
                <Outlet />
            </main>
        </div>
    );
}
