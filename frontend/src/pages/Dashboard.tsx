import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, logout } from '../services/authService';
import type { User } from '../types';
import { AxiosError } from 'axios';

export default function Dashboard() {
    const [user, setUser] = useState<User | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const response = await getProfile();
            setUser(response.user);
        } catch (err) {
            console.error('Error loading profile:', err);
            const axiosErr = err as AxiosError;
            if (axiosErr.response?.status === 401 || axiosErr.response?.status === 403) {
                logout();
                navigate('/login');
            }
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">Loading...</div>
    return (
        <div>
            <h1>Dashboard</h1>
            <p>Username: {user.username}</p>
            <p>MMR: {user.mmr}</p>
            <p>Rank: {user.rank}</p>
            <p>Wins: {(user as User & { wins?: number }).wins} | Losses: {(user as User & { losses?: number }).losses}</p>
            <p>Winrate%: {(user as User & { winRate?: number }).winRate}%</p>
            <button onClick={() => navigate('/tournaments')}>Tournaments</button>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
}
