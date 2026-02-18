import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, type RouteObject } from "react-router-dom";
import "./index.css";

import AppLayout from "./layouts/AppLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";

import LandingPage from "./pages/LandingPage";

let Login = React.lazy(function () { return import("./pages/Login"); });
let Register = React.lazy(function () { return import("./pages/Register"); });
let ForgotPassword = React.lazy(function () { return import("./pages/ForgotPassword"); });
let Dashboard = React.lazy(function () { return import("./pages/Dashboard"); });
let Tournaments = React.lazy(function () { return import("./pages/Tournaments"); });
let Leaderboard = React.lazy(function () { return import("./pages/Leaderboard"); });
let Profile = React.lazy(function () { return import("./pages/Profile"); });
let Admin = React.lazy(function () { return import("./pages/Admin"); });

let publicRoutes: RouteObject[] = [
  { path: "/", element: React.createElement(LandingPage) },
  { path: "/login", element: React.createElement(Suspense, { fallback: null }, React.createElement(Login)) },
  { path: "/register", element: React.createElement(Suspense, { fallback: null }, React.createElement(Register)) },
  { path: "/forgot", element: React.createElement(Suspense, { fallback: null }, React.createElement(ForgotPassword)) }
];

let protectedRoutes: RouteObject[] = [
  { path: "/dashboard", element: React.createElement(Suspense, { fallback: null }, React.createElement(Dashboard)) },
  { path: "/tournaments", element: React.createElement(Suspense, { fallback: null }, React.createElement(Tournaments)) },
  { path: "/leaderboard", element: React.createElement(Suspense, { fallback: null }, React.createElement(Leaderboard)) },
  { path: "/profile/:username", element: React.createElement(Suspense, { fallback: null }, React.createElement(Profile)) }
];

let adminRoutes: RouteObject[] = [
  { path: "/admin", element: React.createElement(Suspense, { fallback: null }, React.createElement(Admin)) }
];

let adminProtection: RouteObject = {
  element: React.createElement(ProtectedRoute, { requireAdmin: true, redirectTo: "/dashboard" }),
  children: adminRoutes
};

let userProtection: RouteObject = {
  element: React.createElement(ProtectedRoute),
  children: protectedRoutes.concat([adminProtection])
};

let allRoutes: RouteObject[] = publicRoutes.concat([userProtection]);

let mainLayout: RouteObject = {
  element: React.createElement(AppLayout),
  children: allRoutes
};

let router = createBrowserRouter([mainLayout]);

let rootElement = document.getElementById("root") as HTMLElement;
let root = ReactDOM.createRoot(rootElement);

root.render(
  React.createElement(React.StrictMode, null,
    React.createElement(RouterProvider, { router: router })
  )
);
