jest.mock('../../models/userModel', () => ({
    find: jest.fn()
}));

const User = require('../../models/userModel');
const { getLeaderboard } = require('../../controllers/leaderboardController');

function buildRes() {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}

describe('leaderboardController', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('getLeaderboard returns 200 with player list', async () => {
        const lean = jest.fn().mockResolvedValue([{ _id: 'u1', username: 'vega', mmr: 500 }]);
        const limit = jest.fn().mockReturnValue({ lean });
        const sort = jest.fn().mockReturnValue({ limit });
        const select = jest.fn().mockReturnValue({ sort });
        User.find.mockReturnValue({ select });

        const req = { query: {} };
        const res = buildRes();

        await getLeaderboard(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ players: expect.any(Array) }));
    });

    test('getLeaderboard uses default limit of 50 when not specified', async () => {
        const lean = jest.fn().mockResolvedValue([]);
        const limit = jest.fn().mockReturnValue({ lean });
        const sort = jest.fn().mockReturnValue({ limit });
        const select = jest.fn().mockReturnValue({ sort });
        User.find.mockReturnValue({ select });

        const req = { query: {} };
        const res = buildRes();

        await getLeaderboard(req, res);

        expect(limit).toHaveBeenCalledWith(50);
    });

    test('getLeaderboard caps limit at 100 for large values', async () => {
        const lean = jest.fn().mockResolvedValue([]);
        const limit = jest.fn().mockReturnValue({ lean });
        const sort = jest.fn().mockReturnValue({ limit });
        const select = jest.fn().mockReturnValue({ sort });
        User.find.mockReturnValue({ select });

        const req = { query: { limit: '200' } };
        const res = buildRes();

        await getLeaderboard(req, res);

        expect(limit).toHaveBeenCalledWith(100);
    });

    test('getLeaderboard returns 500 on DB error', async () => {
        const lean = jest.fn().mockRejectedValue(new Error('DB error'));
        const limit = jest.fn().mockReturnValue({ lean });
        const sort = jest.fn().mockReturnValue({ limit });
        const select = jest.fn().mockReturnValue({ sort });
        User.find.mockReturnValue({ select });

        const req = { query: {} };
        const res = buildRes();

        await getLeaderboard(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});
