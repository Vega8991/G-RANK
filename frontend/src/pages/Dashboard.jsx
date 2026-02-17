import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, logout } from '../services/authService';

export default function Dashboard() {
    const [user, setUser] = useState(null);
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
            if (err.response?.status === 401 || err.response?.status === 403) {
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
            <p>Wins: {user.wins} | Losses: {user.losses}</p>
            <p>Winrate%: {user.winRate}%</p>
            <button onClick={() => navigate('/tournaments')}>Tournaments</button>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
}
