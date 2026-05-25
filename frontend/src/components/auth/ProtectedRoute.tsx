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
    const [navInfo, setNavInfo] = useState<NavInfo | null>(() => getNavInfo());

    useEffect(() => {
        function update() {
            setNavInfo(getNavInfo());
        }

        window.addEventListener(AUTH_CHANGE_EVENT, update);
        return () => {
            window.removeEventListener(AUTH_CHANGE_EVENT, update);
        };
    }, []);

    if (requireAdmin) {
        return navInfo?.role === 'ADMIN' ? <Outlet /> : <Navigate to={redirectTo} replace />;
    }

    return navInfo !== null ? <Outlet /> : <Navigate to={redirectTo} replace />;
}
