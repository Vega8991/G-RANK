import apiClient from './apiClient';

export interface LeaderboardPlayer {
    _id: string;
    username: string;
    mmr: number;
    rank: string;
    wins: number;
    losses: number;
    winRate: number;
    winStreak: number;
    country?: string | null;
    totalMatches: number;
}

export async function getLeaderboard(limit = 50): Promise<LeaderboardPlayer[]> {
    const response = await apiClient.get('/leaderboard', { params: { limit } });
    return (response.data as { players: LeaderboardPlayer[] }).players;
}
