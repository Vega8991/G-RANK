import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getProfile, logout } from "../services/authService";
import { getMyLobbies } from "../services/lobbyService";
import type { User, Lobby } from "../types";

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
    access_denied:         "Riot login cancelled.",
    already_linked:        "This Riot account is already linked to another G-RANK account.",
    token_exchange_failed: "Failed to authenticate with Riot. Try again.",
    account_fetch_failed:  "Could not retrieve your Riot account. Try again.",
    server_error:          "Server error during Riot login. Try again.",
    missing_params:        "Riot login returned unexpected data. Try again.",
    invalid_state:         "Login session expired. Try again.",
};

export interface OauthMsg {
    text: string;
    ok: boolean;
}

export function useDashboard() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [user, setUser] = useState<User | null>(null);
    const [lobbies, setLobbies] = useState<Lobby[]>([]);
    const [loadError, setLoadError] = useState(false);
    const [oauthMsg, setOauthMsg] = useState<OauthMsg | null>(null);

    const loadProfile = useCallback(async function () {
        try {
            const res = await getProfile();
            setUser(res.user);
        } catch (err: unknown) {
            const status = (err as { response?: { status?: number } }).response?.status;
            if (status === 401 || status === 403) {
                await logout();
                navigate("/login");
            } else {
                setLoadError(true);
            }
        }
    }, [navigate]);

    useEffect(function () {
        void loadProfile();
        getMyLobbies()
            .then(function (res) { setLobbies(res.lobbies); })
            .catch(function () { setLobbies([]); setLoadError(true); });
    }, [loadProfile]);

    useEffect(function () {
        const linked = searchParams.get("riot_linked");
        const error = searchParams.get("riot_error");
        if (linked === "1") {
            setOauthMsg({ text: "Riot account linked successfully!", ok: true });
            setSearchParams({}, { replace: true });
        } else if (error) {
            const message = OAUTH_ERROR_MESSAGES[error] ?? "Riot login failed. Try again.";
            setOauthMsg({ text: message, ok: false });
            setSearchParams({}, { replace: true });
        }
    }, [searchParams, setSearchParams]);

    async function handleLogout() {
        await logout();
        navigate("/login");
    }

    return { user, lobbies, loadError, oauthMsg, setOauthMsg, loadProfile, handleLogout };
}
