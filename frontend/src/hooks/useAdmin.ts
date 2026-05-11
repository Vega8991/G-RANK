import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, logout } from "../services/authService";
import {
    getAdminStats, adminGetUsers, adminCreateUser, adminUpdateUser, adminDeleteUser,
    adminGetLobbies, adminUpdateLobby, adminDeleteLobby,
    type AdminStats, type CreateUserPayload, type UpdateUserPayload, type UpdateLobbyPayload,
} from "../services/adminService";
import type { User, Lobby } from "../types";

export interface ToastMsg {
    message: string;
    ok: boolean;
}

export function useAdmin() {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [stats, setStats]   = useState<AdminStats | null>(null);
    const [users, setUsers]   = useState<User[]>([]);
    const [lobbies, setLobbies] = useState<Lobby[]>([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast]   = useState<ToastMsg | null>(null);

    function showToast(message: string, ok = true) {
        setToast({ message, ok });
    }

    const loadAll = useCallback(async function () {
        try {
            const [s, u, l] = await Promise.all([getAdminStats(), adminGetUsers(), adminGetLobbies()]);
            setStats(s);
            setUsers(u);
            setLobbies(l);
        } catch {
            showToast("Failed to load data", false);
        }
    }, []);

    // On mount: verify the user is an admin, then load data.
    useEffect(function () {
        (async () => {
            try {
                const { user } = await getProfile();
                if (user.role !== "ADMIN") {
                    navigate("/dashboard");
                    return;
                }
                setCurrentUser(user);
                await loadAll();
            } catch {
                logout();
                navigate("/login");
            } finally {
                setLoading(false);
            }
        })();
    }, [navigate, loadAll]);

    async function handleSaveUser(editUser: User | "__create__", data: CreateUserPayload | UpdateUserPayload) {
        if (editUser === "__create__") {
            const u = await adminCreateUser(data as CreateUserPayload);
            setUsers(prev => [u, ...prev]);
            showToast("User created");
        } else {
            const u = await adminUpdateUser(editUser._id, data);
            setUsers(prev => prev.map(x => x._id === u._id ? u : x));
            showToast("User updated");
        }
        await loadAll();
    }

    async function handleDeleteUser(user: User) {
        await adminDeleteUser(user._id);
        setUsers(prev => prev.filter(u => u._id !== user._id));
        showToast("User deleted");
        await loadAll();
    }

    async function handleSaveLobby(lobby: Lobby, data: UpdateLobbyPayload) {
        const l = await adminUpdateLobby(lobby._id, data);
        setLobbies(prev => prev.map(x => x._id === l._id ? l : x));
        showToast("Tournament updated");
        await loadAll();
    }

    async function handleDeleteLobby(lobby: Lobby) {
        await adminDeleteLobby(lobby._id);
        setLobbies(prev => prev.filter(l => l._id !== lobby._id));
        showToast("Tournament deleted");
        await loadAll();
    }

    async function handleRefresh() {
        await loadAll();
        showToast("Data refreshed");
    }

    return {
        currentUser, stats, users, lobbies, loading, toast, setToast,
        loadAll, handleSaveUser, handleDeleteUser, handleSaveLobby, handleDeleteLobby, handleRefresh,
    };
}
