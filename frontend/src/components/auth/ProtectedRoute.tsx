import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import type { AuthStatus } from "../../types";

function decodeJwtRole(token: string): string | null {
    try {
        const payload = token.split(".")[1];
        const decoded = JSON.parse(atob(payload));
        return decoded.role ?? null;
    } catch {
        return null;
    }
}

function checkAuthStatus(): AuthStatus {
    const token = localStorage.getItem('token');
    if (!token) return { isLoggedIn: false, userRole: null };
    const role = decodeJwtRole(token);
    if (!role) {
        localStorage.removeItem('token');
        return { isLoggedIn: false, userRole: null };
    }
    return { isLoggedIn: true, userRole: role };
}

interface ProtectedRouteProps {
    isAllowed?: boolean;
    redirectTo?: string;
    requireAdmin?: boolean;
}

export default function ProtectedRoute({ isAllowed: staticIsAllowed, redirectTo = "/login", requireAdmin = false }: ProtectedRouteProps) {
    const [authStatus, setAuthStatus] = useState<AuthStatus>(checkAuthStatus());

    useEffect(() => {
        const update = () => setAuthStatus(checkAuthStatus());
        update();
        window.addEventListener('storage', update);
        window.addEventListener('auth-change', update);
        return () => {
            window.removeEventListener('storage', update);
            window.removeEventListener('auth-change', update);
        };
    }, []);

    if (typeof staticIsAllowed === "boolean" && !staticIsAllowed) {
        return <Navigate to={redirectTo} replace />;
    }

    if (requireAdmin) {
        return authStatus.userRole === "ADMIN"
            ? <Outlet />
            : <Navigate to={redirectTo} replace />;
    }

    return authStatus.isLoggedIn ? <Outlet /> : <Navigate to={redirectTo} replace />;
}
