import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { getProfile, logout } from "../services/authService";
import type { User } from "../types";

type UserWithStats = User & { wins?: number; losses?: number; winRate?: number };

export default function Dashboard() {
    const [user, setUser] = useState<User | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadProfile();
    }, []);

    async function loadProfile() {
        try {
            const response = await getProfile();
            setUser(response.user);
        } catch (err) {
            console.error("Error loading profile:", err);
            const axiosErr = err as AxiosError;
            const isUnauthorized = axiosErr.response?.status === 401 || axiosErr.response?.status === 403;
            if (isUnauthorized) {
                logout();
                navigate("/login");
            }
        }
    }

    function handleLogout() {
        logout();
        navigate("/login");
    }

    if (!user) {
        return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">Loading...</div>;
    }

    const userStats = user as UserWithStats;

    return (
        <div>
            <h1>Dashboard</h1>
            <p>Username: {user.username}</p>
            <p>MMR: {user.mmr}</p>
            <p>Rank: {user.rank}</p>
            <p>Wins: {userStats.wins} | Losses: {userStats.losses}</p>
            <p>Winrate%: {userStats.winRate}%</p>
            <button onClick={() => navigate("/tournaments")}>Tournaments</button>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
}
