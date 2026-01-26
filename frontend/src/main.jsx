import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";

import AppLayout from "./layouts/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Tournaments from "./pages/Tournaments";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";

let isUserLogged = true;
let userRole = "USER";

let publicRoutes = [
  { path: "/", element: React.createElement(LandingPage) },
  { path: "/login", element: React.createElement(Login) },
  { path: "/register", element: React.createElement(Register) },
  { path: "/forgot", element: React.createElement(ForgotPassword) }
];

let protectedRoutes = [
  { path: "/dashboard", element: React.createElement(Dashboard) },
  { path: "/tournaments", element: React.createElement(Tournaments) },
  { path: "/leaderboard", element: React.createElement(Leaderboard) },
  { path: "/profile/:username", element: React.createElement(Profile) }
];

let adminRoutes = [
  { path: "/admin", element: React.createElement(Admin) }
];

let adminProtection = {
  element: React.createElement(ProtectedRoute, { isAllowed: userRole === "ADMIN", redirectTo: "/dashboard" }),
  children: adminRoutes
};

let userProtection = {
  element: React.createElement(ProtectedRoute, { isAllowed: isUserLogged }),
  children: protectedRoutes.concat([adminProtection])
};

let allRoutes = publicRoutes.concat([userProtection]);

let mainLayout = {
  element: React.createElement(AppLayout),
  children: allRoutes
};

let router = createBrowserRouter([mainLayout]);

let rootElement = document.getElementById("root");
let root = ReactDOM.createRoot(rootElement);

root.render(
  React.createElement(React.StrictMode, null,
    React.createElement(RouterProvider, { router: router })
  )
);