import { lazy, Suspense } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Crown, Home, Trophy, User, Shield, ChevronDown } from "lucide-react";
import { prefetchRoute } from "../services/routePrefetch";
import { useViewportPrefetch } from "../hooks/useViewportPrefetch";

const CustomCursor = lazy(function () {
    return import("../components/cursor/CustomCursor");
});

export default function AppLayout() {
    const tournamentsViewportRef = useViewportPrefetch("tournaments");
    const leaderboardViewportRef = useViewportPrefetch("leaderboard");
    const dashboardViewportRef = useViewportPrefetch("dashboard");
    const loginViewportRef = useViewportPrefetch("login");
    const registerViewportRef = useViewportPrefetch("register");

    function getPrefetchProps(route: "login" | "register" | "leaderboard" | "tournaments" | "dashboard") {
        return {
            onMouseEnter: function () { prefetchRoute(route); },
            onFocus: function () { prefetchRoute(route); },
            onTouchStart: function () { prefetchRoute(route); }
        };
    }

    let getLinkClass = function (isActive: boolean): string {
        let baseClass = "flex items-center gap-2 text-sm font-medium transition-colors pb-1 border-b-2";
        let activeClass = "border-[#dc143c] text-white";
        let inactiveClass = "border-transparent text-[#d1d5db] hover:text-white";

        if (isActive) {
            return baseClass + " " + activeClass;
        }
        return baseClass + " " + inactiveClass;
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white relative">
            <Suspense fallback={null}>
                <CustomCursor />
            </Suspense>
            <nav className="border-b border-[#2a2a2a] sticky top-0 z-40 backdrop-blur-lg bg-[#0a0a0a]/95">
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
                                <NavLink to="/" className={function ({ isActive }: { isActive: boolean }) { return getLinkClass(isActive); }}>
                                    <Home size={16} /> Home
                                </NavLink>
                                <NavLink to="/tournaments" className={function ({ isActive }: { isActive: boolean }) { return getLinkClass(isActive); }} {...getPrefetchProps("tournaments")} ref={tournamentsViewportRef}>
                                    <Trophy size={16} /> Tournaments
                                </NavLink>
                                <NavLink to="/leaderboard" className={function ({ isActive }: { isActive: boolean }) { return getLinkClass(isActive); }} {...getPrefetchProps("leaderboard")} ref={leaderboardViewportRef}>
                                    <Crown size={16} /> Leaderboard
                                </NavLink>
                                <NavLink to="/dashboard" className={function ({ isActive }: { isActive: boolean }) { return getLinkClass(isActive); }} {...getPrefetchProps("dashboard")} ref={dashboardViewportRef}>
                                    <User size={16} /> Dashboard
                                </NavLink>
                                <NavLink to="/admin" className={function ({ isActive }: { isActive: boolean }) { return getLinkClass(isActive); }}>
                                    <Shield size={16} /> Admin
                                </NavLink>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {false ? (
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
                            ) : (
                                <div className="flex items-center gap-2">
                                    <NavLink to="/login" {...getPrefetchProps("login")} ref={loginViewportRef}>
                                        <button className="px-4 py-2 text-sm font-medium text-white hover:bg-[#111111] rounded-lg transition-colors">
                                            Login
                                        </button>
                                    </NavLink>
                                    <NavLink to="/register" {...getPrefetchProps("register")} ref={registerViewportRef}>
                                        <button className="px-4 py-2 text-sm font-medium bg-[#dc143c] text-white rounded-lg hover:bg-[#b01030] transition-colors">
                                            Sign Up
                                        </button>
                                    </NavLink>
                                </div>
                            )}
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
