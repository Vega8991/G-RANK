const User = require('../../models/userModel');
const { getRankFromMMR, calculateMMRChange, updateUserStats } = require('../../services/mmrService');

jest.mock('../../models/userModel', () => ({
    findById: jest.fn()
}));

describe('mmrService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('getRankFromMMR returns the expected rank boundaries', () => {
        expect(getRankFromMMR(0)).toBe('Bronze');
        expect(getRankFromMMR(500)).toBe('Silver');
        expect(getRankFromMMR(1000)).toBe('Gold');
        expect(getRankFromMMR(1500)).toBe('Platinum');
        expect(getRankFromMMR(2000)).toBe('Diamond');
        expect(getRankFromMMR(2500)).toBe('Master');
        expect(getRankFromMMR(3000)).toBe('Elite');
    });

    test('getRankFromMMR fallback for invalid input', () => {
        expect(getRankFromMMR(-1)).toBe('Bronce');
    });

    test('calculateMMRChange returns positive for winner and negative for loser', () => {
        expect(calculateMMRChange(250, true)).toBe(50);
        expect(calculateMMRChange(250, false)).toBe(-25);
        expect(calculateMMRChange(2200, true)).toBe(25);
        expect(calculateMMRChange(2200, false)).toBe(-25);
    });

    test('updateUserStats throws when user does not exist', async () => {
        User.findById.mockResolvedValue(null);

        await expect(updateUserStats('missing-user', true, 50)).rejects.toThrow('User not found');
    });

    test('updateUserStats updates winner stats correctly', async () => {
        const save = jest.fn().mockResolvedValue(undefined);
        const user = {
            _id: 'u1',
            mmr: 250,
            rank: 'Bronze',
            wins: 5,
            losses: 3,
            winRate: 0,
            winStreak: 2,
            save
        };

        User.findById.mockResolvedValue(user);

        const result = await updateUserStats('u1', true, 50);

        expect(user.mmr).toBe(300);
        expect(user.rank).toBe('Bronze');
        expect(user.wins).toBe(6);
        expect(user.losses).toBe(3);
        expect(user.winStreak).toBe(3);
        expect(user.winRate).toBe('66.67');
        expect(save).toHaveBeenCalledTimes(1);
        expect(result.success).toBe(true);
        expect(result.mmrChange).toBe(50);
    });

    test('updateUserStats updates loser stats and does not allow negative MMR', async () => {
        const save = jest.fn().mockResolvedValue(undefined);
        const user = {
            _id: 'u2',
            mmr: 10,
            rank: 'Bronze',
            wins: 0,
            losses: 0,
            winRate: 0,
            winStreak: 4,
            save
        };

        User.findById.mockResolvedValue(user);

        const result = await updateUserStats('u2', false, -25);

        expect(user.mmr).toBe(0);
        expect(user.losses).toBe(1);
        expect(user.winStreak).toBe(0);
        expect(user.winRate).toBe('0.00');
        expect(result.newRank).toBe('Bronze');
    });
});
