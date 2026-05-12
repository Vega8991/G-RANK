import apiClient from '../../services/apiClient';
import { getLeaderboard } from '../../services/leaderboardService';

vi.mock('../../services/apiClient', () => ({
    default: {
        get: vi.fn(),
    }
}));

describe('leaderboardService', () => {
    const mockedApiClient = vi.mocked(apiClient);

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('calls GET /leaderboard with the limit param', async () => {
        mockedApiClient.get.mockResolvedValueOnce({ data: { players: [] } });

        await getLeaderboard(20);

        expect(mockedApiClient.get).toHaveBeenCalledWith('/leaderboard', { params: { limit: 20 } });
    });

    it('uses 50 as the default limit', async () => {
        mockedApiClient.get.mockResolvedValueOnce({ data: { players: [] } });

        await getLeaderboard();

        expect(mockedApiClient.get).toHaveBeenCalledWith('/leaderboard', { params: { limit: 50 } });
    });

    it('returns the players array from the response', async () => {
        const fakePlayers = [
            { _id: '1', username: 'vega', mmr: 2000, rank: 'Master', wins: 50, losses: 10, winRate: 83.3, winStreak: 5, country: 'ES', totalMatches: 60 },
            { _id: '2', username: 'paco', mmr: 1800, rank: 'Gold',   wins: 30, losses: 20, winRate: 60.0, winStreak: 0, country: 'ES', totalMatches: 50 },
        ];
        mockedApiClient.get.mockResolvedValueOnce({ data: { players: fakePlayers } });

        const result = await getLeaderboard();

        expect(result).toEqual(fakePlayers);
    });

    it('returns an empty array when there are no players', async () => {
        mockedApiClient.get.mockResolvedValueOnce({ data: { players: [] } });

        const result = await getLeaderboard();

        expect(result).toEqual([]);
    });

    it('throws when the request fails', async () => {
        mockedApiClient.get.mockRejectedValueOnce(new Error('Server error'));

        await expect(getLeaderboard()).rejects.toThrow('Server error');
    });
});
