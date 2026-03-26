jest.mock('../../models/matchResultModel', () => ({
    create: jest.fn(),
    find: jest.fn()
}));

jest.mock('../../models/lobbyModel', () => ({
    findById: jest.fn()
}));

jest.mock('../../models/lobbyParticipantModel', () => ({
    findOne: jest.fn(),
    find: jest.fn()
}));

jest.mock('axios', () => ({
    get: jest.fn()
}));

jest.mock('mongoose', () => ({
    startSession: jest.fn()
}));

jest.mock('../../services/mmrService', () => ({
    calculateMMRChange: jest.fn(),
    updateUserStats: jest.fn()
}));

const mongoose = require('mongoose');
const Lobby = require('../../models/lobbyModel');
const MatchResult = require('../../models/matchResultModel');
const {
    submitReplay,
    getLobbyResults
} = require('../../controllers/matchResultController');

function buildRes() {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}

describe('matchResultController', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('submitReplay maps LOBBY_NOT_FOUND to 404', async () => {
        const session = {
            withTransaction: jest.fn(async () => { throw new Error('LOBBY_NOT_FOUND'); }),
            endSession: jest.fn().mockResolvedValue(undefined)
        };
        mongoose.startSession.mockResolvedValue(session);

        const req = { userId: 'u1', body: { lobbyId: 'l1', replayUrl: 'https://replay.pokemonshowdown.com/test' } };
        const res = buildRes();

        await submitReplay(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Lobby not found' }));
    });

    test('submitReplay maps INVALID_PARTICIPANT_COUNT to 400 with count', async () => {
        const session = {
            withTransaction: jest.fn(async () => { throw new Error('INVALID_PARTICIPANT_COUNT:3'); }),
            endSession: jest.fn().mockResolvedValue(undefined)
        };
        mongoose.startSession.mockResolvedValue(session);

        const req = { userId: 'u1', body: { lobbyId: 'l1', replayUrl: 'https://replay.pokemonshowdown.com/test' } };
        const res = buildRes();

        await submitReplay(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Lobby must have exactly 2 participants. Found: 3' }));
    });

    test('submitReplay maps ALREADY_SUBMITTED to 400', async () => {
        const session = {
            withTransaction: jest.fn(async () => { throw new Error('ALREADY_SUBMITTED'); }),
            endSession: jest.fn().mockResolvedValue(undefined)
        };
        mongoose.startSession.mockResolvedValue(session);

        const req = { userId: 'u1', body: { lobbyId: 'l1', replayUrl: 'https://replay.pokemonshowdown.com/test' } };
        const res = buildRes();

        await submitReplay(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('submitReplay maps unknown errors to 500', async () => {
        const session = {
            withTransaction: jest.fn(async () => { throw new Error('UNEXPECTED_ERROR'); }),
            endSession: jest.fn().mockResolvedValue(undefined)
        };
        mongoose.startSession.mockResolvedValue(session);

        const req = { userId: 'u1', body: { lobbyId: 'l1', replayUrl: 'https://replay.pokemonshowdown.com/test' } };
        const res = buildRes();

        await submitReplay(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });

    test('getLobbyResults returns 404 when lobby does not exist', async () => {
        Lobby.findById.mockResolvedValue(null);

        const req = { params: { lobbyId: 'l1' } };
        const res = buildRes();

        await getLobbyResults(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('getLobbyResults returns lobby and results', async () => {
        Lobby.findById.mockResolvedValue({ _id: 'l1', name: 'Lobby' });

        const populate3 = jest.fn().mockResolvedValue([{ _id: 'r1' }]);
        const populate2 = jest.fn().mockReturnValue({ populate: populate3 });
        const populate1 = jest.fn().mockReturnValue({ populate: populate2 });
        MatchResult.find.mockReturnValue({ populate: populate1 });

        const req = { params: { lobbyId: 'l1' } };
        const res = buildRes();

        await getLobbyResults(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });
});
