export type RouteKey = "landing" | "login" | "register" | "forgot" | "dashboard" | "tournaments" | "leaderboard" | "profile" | "admin";

const routeLoaders: Record<RouteKey, () => Promise<unknown>> = {
    landing: function () { return import("../pages/LandingPage"); },
    login: function () { return import("../pages/Login"); },
    register: function () { return import("../pages/Register"); },
    forgot: function () { return import("../pages/ForgotPassword"); },
    dashboard: function () { return import("../pages/Dashboard"); },
    tournaments: function () { return import("../pages/Tournaments"); },
    leaderboard: function () { return import("../pages/Leaderboard"); },
    profile: function () { return import("../pages/Profile"); },
    admin: function () { return import("../pages/Admin"); }
};

const prefetchedRoutes = new Set<RouteKey>();

export function prefetchRoute(route: RouteKey): void {
    if (prefetchedRoutes.has(route)) {
        return;
    }

    prefetchedRoutes.add(route);

    void routeLoaders[route]().catch(function () {
        prefetchedRoutes.delete(route);
    });
}
