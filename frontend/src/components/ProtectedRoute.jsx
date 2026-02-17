import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";

function checkAuthStatus() {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
        return { isLoggedIn: false, userRole: null };
    }
    
    try {
        const user = JSON.parse(userStr);
        return { isLoggedIn: true, userRole: user.role || null };
    } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return { isLoggedIn: false, userRole: null };
    }
}

export default function ProtectedRoute({ isAllowed: staticIsAllowed, redirectTo = "/login", requireAdmin = false }) {
    const [authStatus, setAuthStatus] = useState(checkAuthStatus());
    
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
