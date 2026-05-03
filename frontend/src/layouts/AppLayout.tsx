import { lazy, Suspense, useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Crown, Home, Trophy, User, Shield, ChevronDown, LogOut, LayoutDashboard } from "lucide-react";
import { prefetchRoute } from "../services/routePrefetch";
import { useViewportPrefetch } from "../hooks/useViewportPrefetch";
import { getNavInfo, logout, type NavInfo } from "../services/authService";

const TargetCursor = lazy(() => import("../components/cursor/TargetCursor"));

const baseLinkClass = "flex items-center gap-2 text-sm font-medium transition-colors pb-1 border-b-2";
const activeLinkClass = "border-[#dc143c] text-white";
const inactiveLinkClass = "border-transparent text-[#d1d5db] hover:text-white";

function getLinkClass(isActive: boolean): string {
    return isActive ? `${baseLinkClass} ${activeLinkClass}` : `${baseLinkClass} ${inactiveLinkClass}`;
}

export default function AppLayout() {
    const navigate = useNavigate();
    const [navInfo, setNavInfo] = useState<NavInfo | null>(getNavInfo);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const lobbiesViewportRef     = useViewportPrefetch("lobbies");
    const leaderboardViewportRef = useViewportPrefetch("leaderboard");
    const dashboardViewportRef   = useViewportPrefetch("dashboard");
    const loginViewportRef       = useViewportPrefetch("login");
    const registerViewportRef    = useViewportPrefetch("register");

    useEffect(() => {
        function update() { setNavInfo(getNavInfo()); }
        window.addEventListener('auth-change', update);
        window.addEventListener('storage', update);
        return () => {
            window.removeEventListener('auth-change', update);
            window.removeEventListener('storage', update);
        };
    }, []);

    useEffect(() => {
        if (!dropdownOpen) return;
        function handler() { setDropdownOpen(false); }
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [dropdownOpen]);

    function handleLogout() {
        logout();
        setDropdownOpen(false);
        navigate('/login');
    }

    function getPrefetchProps(route: "login" | "register" | "leaderboard" | "lobbies" | "dashboard") {
        return {
            onMouseEnter: () => prefetchRoute(route),
            onFocus: () => prefetchRoute(route),
            onTouchStart: () => prefetchRoute(route)
        };
    }

    const isAdmin = navInfo?.role === "ADMIN";
    const initial = navInfo?.username.charAt(0).toUpperCase() ?? "";

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white relative">
            <Suspense fallback={null}>
                <TargetCursor
                    spinDuration={2.8}
                    hideDefaultCursor
                    parallaxOn
                    hoverDuration={0.6}
                    targetSelector="a, button, input, select, textarea, [role='button']"
                />
            </Suspense>

            <nav className="border-b border-[#2a2a2a] sticky top-0 z-40 backdrop-blur-lg bg-[#0a0a0a]/95">
                <div className="max-w-[1512px] mx-auto px-6 md:px-20">
                    <div className="flex items-center justify-between h-16">

                        {/* Logo + nav links */}
                        <div className="flex items-center gap-12">
                            <NavLink to="/" className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded bg-[#dc143c] flex items-center justify-center">
                                    <Crown size={18} className="text-white" />
                                </div>
                                <span className="font-extrabold text-lg">G-RANK</span>
                            </NavLink>

                            <div className="hidden md:flex items-center gap-8">
                                <NavLink to="/" className={({ isActive }) => getLinkClass(isActive)}>
                                    <Home size={16} /> Home
                                </NavLink>
                                <NavLink to="/lobbies" className={({ isActive }) => getLinkClass(isActive)}
                                    {...getPrefetchProps("lobbies")} ref={lobbiesViewportRef}>
                                    <Trophy size={16} /> Lobbies
                                </NavLink>
                                <NavLink to="/leaderboard" className={({ isActive }) => getLinkClass(isActive)}
                                    {...getPrefetchProps("leaderboard")} ref={leaderboardViewportRef}>
                                    <Crown size={16} /> Leaderboard
                                </NavLink>
                                {navInfo && (
                                    <NavLink to="/dashboard" className={({ isActive }) => getLinkClass(isActive)}
                                        {...getPrefetchProps("dashboard")} ref={dashboardViewportRef}>
                                        <LayoutDashboard size={16} /> Dashboard
                                    </NavLink>
                                )}
                                {isAdmin && (
                                    <NavLink to="/admin" className={({ isActive }) => getLinkClass(isActive)}>
                                        <Shield size={16} /> Admin
                                    </NavLink>
                                )}
                            </div>
                        </div>

                        {/* Auth area */}
                        <div className="flex items-center gap-3">
                            {navInfo ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setDropdownOpen(o => !o)}
                                        className="flex items-center gap-2.5 hover:bg-[#111111] px-3 py-2 rounded-xl transition-colors"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-[#dc143c] flex items-center justify-center text-sm font-black">
                                            {initial}
                                        </div>
                                        <div className="hidden md:block text-left">
                                            <p className="text-sm font-semibold leading-none">{navInfo.username}</p>
                                            <p className="text-xs font-bold mt-0.5 text-[#dc143c]">
                                                {isAdmin ? "Admin" : "Player"}
                                            </p>
                                        </div>
                                        <ChevronDown size={14} className={`text-[#6b7280] transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
                                    </button>

                                    {dropdownOpen && (
                                        <div
                                            className="absolute right-0 top-[calc(100%+8px)] w-52 rounded-xl border border-[#2a2a2a] overflow-hidden shadow-2xl z-50"
                                            style={{ background: "rgba(10,10,10,0.98)", backdropFilter: "blur(20px)" }}
                                            onMouseDown={e => e.stopPropagation()}
                                        >
                                            <NavLink to={`/profile/${navInfo.username}`}
                                                onClick={() => setDropdownOpen(false)}
                                                className="flex items-center gap-2.5 px-4 py-3 text-sm text-[#d1d5db] hover:text-white hover:bg-white/5 transition-colors">
                                                <User size={14} /> My Profile
                                            </NavLink>
                                            <NavLink to="/dashboard"
                                                onClick={() => setDropdownOpen(false)}
                                                className="flex items-center gap-2.5 px-4 py-3 text-sm text-[#d1d5db] hover:text-white hover:bg-white/5 transition-colors">
                                                <LayoutDashboard size={14} /> Dashboard
                                            </NavLink>
                                            {isAdmin && (
                                                <NavLink to="/admin"
                                                    onClick={() => setDropdownOpen(false)}
                                                    className="flex items-center gap-2.5 px-4 py-3 text-sm text-[#dc143c] hover:bg-white/5 transition-colors">
                                                    <Shield size={14} /> Admin Panel
                                                </NavLink>
                                            )}
                                            <div className="border-t border-[#2a2a2a]" />
                                            <button onClick={handleLogout}
                                                className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors">
                                                <LogOut size={14} /> Sign out
                                            </button>
                                        </div>
                                    )}
                                </div>
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
