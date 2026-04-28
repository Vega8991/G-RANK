import axios from 'axios';
import { API_URL } from '../config/api';

export interface LeaderboardPlayer {
    _id: string;
    username: string;
    mmr: number;
    rank: string;
    wins: number;
    losses: number;
    winRate: number;
    winStreak: number;
    country: string;
    totalMatches: number;
}

export async function getLeaderboard(limit = 50): Promise<LeaderboardPlayer[]> {
    const response = await axios.get(`${API_URL}/leaderboard`, { params: { limit } });
    return response.data.players;
}
