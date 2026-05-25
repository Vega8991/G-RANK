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
const LobbyParticipant = require('../../models/lobbyParticipantModel');
const MatchResult = require('../../models/matchResultModel');
const axios = require('axios');
const mmrService = require('../../services/mmrService');
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

    test('submitReplay returns 201 on success', async () => {
        const winnerParticipant = {
            userId: { _id: 'winner-id', username: 'PlayerA', mmr: 250 },
            mmrAfter: null,
            mmrChange: null,
            hasSubmittedResults: false,
            save: jest.fn().mockResolvedValue(undefined)
        };
        const loserParticipant = {
            userId: { _id: 'loser-id', username: 'PlayerB', mmr: 250 },
            mmrAfter: null,
            mmrChange: null,
            save: jest.fn().mockResolvedValue(undefined)
        };
        const submitterParticipant = {
            lobbyId: 'l1',
            userId: 'u1',
            hasSubmittedResults: false,
            save: jest.fn().mockResolvedValue(undefined)
        };
        const lobbyObj = {
            _id: 'l1',
            status: 'pending',
            save: jest.fn().mockResolvedValue(undefined)
        };

        const session = {
            withTransaction: jest.fn(async (fn) => { await fn(); }),
            endSession: jest.fn().mockResolvedValue(undefined)
        };
        mongoose.startSession.mockResolvedValue(session);

        Lobby.findById.mockReturnValue({ session: jest.fn().mockResolvedValue(lobbyObj) });
        LobbyParticipant.findOne.mockReturnValue({ session: jest.fn().mockResolvedValue(submitterParticipant) });
        axios.get.mockResolvedValue({ data: { log: '|win|PlayerA' } });
        LobbyParticipant.find.mockReturnValue({
            populate: jest.fn().mockReturnValue({
                session: jest.fn().mockResolvedValue([winnerParticipant, loserParticipant])
            })
        });
        MatchResult.create.mockResolvedValue([{}]);
        mmrService.calculateMMRChange.mockReturnValue(50);
        mmrService.updateUserStats
            .mockResolvedValueOnce({ user: { mmr: 300, rank: 'Bronze', wins: 1, losses: 0, winRate: 100, winStreak: 1 } })
            .mockResolvedValueOnce({ user: { mmr: 225, rank: 'Bronze', wins: 0, losses: 1, winRate: 0, winStreak: 0 } });

        const req = { userId: 'u1', body: { lobbyId: 'l1', replayUrl: 'https://replay.pokemonshowdown.com/test-id' } };
        const res = buildRes();

        await submitReplay(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
    });

    test('submitReplay returns 500 when submitResult is undefined after transaction', async () => {
        const session = {
            withTransaction: jest.fn().mockResolvedValue(undefined),
            endSession: jest.fn().mockResolvedValue(undefined)
        };
        mongoose.startSession.mockResolvedValue(session);

        const req = { userId: 'u1', body: { lobbyId: 'l1', replayUrl: 'https://replay.pokemonshowdown.com/test' } };
        const res = buildRes();

        await submitReplay(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});
