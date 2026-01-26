import { NavLink, Outlet } from "react-router-dom";

export default function AppLayout() {
    return (
        <div className="min-h-screen bg-neutral-950 text-white">
            <div className="border-b border-white/10 bg-neutral-950">
                <div className="mx-auto max-w-6xl p-3 flex gap-3">
                    <NavLink to="/" className="hover:text-red-500">Home</NavLink>
                    <NavLink to="/tournaments" className="hover:text-red-500">Tournaments</NavLink>
                    <NavLink to="/leaderboard" className="hover:text-red-500">Leaderboard</NavLink>
                    <NavLink to="/dashboard" className="hover:text-red-500">Dashboard</NavLink>
                    <NavLink to="/admin" className="hover:text-red-500">Admin</NavLink>
                    <div className="ml-auto">
                        <NavLink to="/login" className="hover:text-red-500">Login</NavLink>
                    </div>
                </div>
            </div>
            <main className="mx-auto max-w-6xl p-4">
                <Outlet />
            </main>
        </div>
    );
}
