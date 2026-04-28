import React, { StrictMode, Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, type RouteObject } from "react-router-dom";
import "./index.css";

import AppLayout from "./layouts/AppLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const LandingPage     = lazy(() => import("./pages/LandingPage"));
const Login           = lazy(() => import("./pages/Login"));
const Register        = lazy(() => import("./pages/Register"));
const ForgotPassword  = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword   = lazy(() => import("./pages/ResetPassword"));
const VerifyEmail     = lazy(() => import("./pages/VerifyEmail"));
const NotFound        = lazy(() => import("./pages/NotFound"));
const Dashboard       = lazy(() => import("./pages/Dashboard"));
const Lobbies         = lazy(() => import("./pages/Lobbies"));
const Leaderboard     = lazy(() => import("./pages/Leaderboard"));
const Profile         = lazy(() => import("./pages/Profile"));
const Admin           = lazy(() => import("./pages/Admin"));

function withSuspense(element: React.ReactElement) {
  return <Suspense fallback={null}>{element}</Suspense>;
}

const publicRoutes: RouteObject[] = [
  { path: "/",                element: withSuspense(<LandingPage />) },
  { path: "/login",           element: withSuspense(<Login />) },
  { path: "/register",        element: withSuspense(<Register />) },
  { path: "/forgot-password", element: withSuspense(<ForgotPassword />) },
  { path: "/reset-password",  element: withSuspense(<ResetPassword />) },
  { path: "/verify-email",    element: withSuspense(<VerifyEmail />) },
  { path: "/leaderboard",     element: withSuspense(<Leaderboard />) },
  { path: "/profile/:username", element: withSuspense(<Profile />) },
];

const protectedRoutes: RouteObject[] = [
  { path: "/dashboard", element: withSuspense(<Dashboard />) },
  { path: "/lobbies",   element: withSuspense(<Lobbies />) },
];

const adminRoutes: RouteObject[] = [
  { path: "/admin", element: withSuspense(<Admin />) }
];

const adminProtection: RouteObject = {
  element: <ProtectedRoute requireAdmin redirectTo="/dashboard" />,
  children: adminRoutes
};

const userProtection: RouteObject = {
  element: <ProtectedRoute />,
  children: protectedRoutes.concat([adminProtection])
};

const catchAll: RouteObject = {
  path: "*",
  element: withSuspense(<NotFound />)
};

const allRoutes: RouteObject[] = publicRoutes.concat([userProtection, catchAll]);

const mainLayout: RouteObject = {
  element: <AppLayout />,
  children: allRoutes
};

const router = createBrowserRouter([mainLayout]);

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

root.render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
