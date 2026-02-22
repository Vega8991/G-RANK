import { StrictMode, Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, type RouteObject } from "react-router-dom";
import "./index.css";

import AppLayout from "./layouts/AppLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const LandingPage = lazy(() => import("./pages/LandingPage"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Lobbies = lazy(() => import("./pages/Lobbies"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const Profile = lazy(() => import("./pages/Profile"));
const Admin = lazy(() => import("./pages/Admin"));

function withSuspense(element: JSX.Element) {
  return <Suspense fallback={null}>{element}</Suspense>;
}

const publicRoutes: RouteObject[] = [
  { path: "/", element: withSuspense(<LandingPage />) },
  { path: "/login", element: withSuspense(<Login />) },
  { path: "/register", element: withSuspense(<Register />) },
  { path: "/forgot", element: withSuspense(<ForgotPassword />) }
];

const protectedRoutes: RouteObject[] = [
  { path: "/dashboard", element: withSuspense(<Dashboard />) },
  { path: "/lobbies", element: withSuspense(<Lobbies />) },
  { path: "/leaderboard", element: withSuspense(<Leaderboard />) },
  { path: "/profile/:username", element: withSuspense(<Profile />) }
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

const allRoutes: RouteObject[] = publicRoutes.concat([userProtection]);

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
