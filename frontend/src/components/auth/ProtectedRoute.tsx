import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { AUTH_CHANGE_EVENT } from "../../constants/events";
import { getNavInfo } from "../../services/authService";
import type { NavInfo } from "../../services/authService";

interface ProtectedRouteProps {
    redirectTo?: string;
    requireAdmin?: boolean;
}

export default function ProtectedRoute({ redirectTo = "/login", requireAdmin = false }: ProtectedRouteProps) {
    // Use a function initializer so getNavInfo() runs synchronously on first render.
    // This avoids showing a blank screen or flashing a redirect before auth is known.
    const [navInfo, setNavInfo] = useState<NavInfo | null>(() => getNavInfo());

    useEffect(() => {
        // Keep auth state in sync when the user logs in/out in another tab
        // or when the app dispatches an auth-change event.
        function update() {
            setNavInfo(getNavInfo());
        }

        window.addEventListener('storage', update);
        window.addEventListener(AUTH_CHANGE_EVENT, update);
        return () => {
            window.removeEventListener('storage', update);
            window.removeEventListener(AUTH_CHANGE_EVENT, update);
        };
    }, []);

    if (requireAdmin) {
        return navInfo?.role === 'ADMIN' ? <Outlet /> : <Navigate to={redirectTo} replace />;
    }

    return navInfo !== null ? <Outlet /> : <Navigate to={redirectTo} replace />;
}
