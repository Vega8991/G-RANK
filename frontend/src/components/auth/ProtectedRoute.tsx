import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import type { AuthStatus } from "../../types";

interface ProtectedRouteProps {
    isAllowed?: boolean;
    redirectTo?: string;
    requireAdmin?: boolean;
}

function checkAuthStatus(): AuthStatus {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
        return { isLoggedIn: false, userRole: null };
    }
    
    try {
        const user = JSON.parse(userStr);
        return { isLoggedIn: true, userRole: user.role || 'USER' };
    } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return { isLoggedIn: false, userRole: null };
    }
}

export default function ProtectedRoute({ isAllowed: staticIsAllowed, redirectTo = "/login", requireAdmin = false }: ProtectedRouteProps) {
    const [authStatus, setAuthStatus] = useState<AuthStatus>(checkAuthStatus());
    
    useEffect(() => {
        const updateAuthStatus = () => {
            setAuthStatus(checkAuthStatus());
        };
        
        updateAuthStatus();
        
        window.addEventListener('storage', updateAuthStatus);
        
        window.addEventListener('auth-change', updateAuthStatus);
        
        return () => {
            window.removeEventListener('storage', updateAuthStatus);
            window.removeEventListener('auth-change', updateAuthStatus);
        };
    }, []);

    if (typeof staticIsAllowed === "boolean" && !staticIsAllowed) {
        return <Navigate to={redirectTo} replace />;
    }
    
    if (requireAdmin) {
        if (authStatus.userRole !== "ADMIN") {
            return <Navigate to={redirectTo} replace />;
        }
        return <Outlet />;
    }
    
    if (!authStatus.isLoggedIn) {
        return <Navigate to={redirectTo} replace />;
    }
    
    return <Outlet />;
}
