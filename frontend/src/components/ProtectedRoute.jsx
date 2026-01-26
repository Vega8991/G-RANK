import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute({ isAllowed, redirectTo = "/login" }) {
    if (!isAllowed) {
        return <Navigate to={redirectTo} replace />;
    }
    return <Outlet />;
}
