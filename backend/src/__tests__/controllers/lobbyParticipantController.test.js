jest.mock('../../models/lobbyModel', () => ({
    findById: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findByIdAndUpdate: jest.fn()
}));

jest.mock('../../models/lobbyParticipantModel', () => ({
    findOne: jest.fn(),
    find: jest.fn(),
    findOneAndDelete: jest.fn(),
    create: jest.fn()
}));

jest.mock('../../models/userModel', () => ({
    findById: jest.fn()
}));

jest.mock('mongoose', () => ({
    startSession: jest.fn()
}));

const mongoose = require('mongoose');
const LobbyParticipant = require('../../models/lobbyParticipantModel');
const {
    registerToLobby,
    getMyLobbies,
    leaveLobby
} = require('../../controllers/lobbyParticipantController');

function buildRes() {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}

describe('lobbyParticipantController', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('registerToLobby maps LOBBY_NOT_FOUND to 404', async () => {
        const session = {
            withTransaction: jest.fn(async () => { throw new Error('LOBBY_NOT_FOUND'); }),
            endSession: jest.fn().mockResolvedValue(undefined)
        };
        mongoose.startSession.mockResolvedValue(session);

        const req = { userId: 'u1', body: { lobbyId: 'l1' } };
        const res = buildRes();

        await registerToLobby(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Lobby not found' }));
        expect(session.endSession).toHaveBeenCalled();
    });

    test('registerToLobby maps ALREADY_REGISTERED to 400', async () => {
        const session = {
            withTransaction: jest.fn(async () => { throw new Error('ALREADY_REGISTERED'); }),
            endSession: jest.fn().mockResolvedValue(undefined)
        };
        mongoose.startSession.mockResolvedValue(session);

        const req = { userId: 'u1', body: { lobbyId: 'l1' } };
        const res = buildRes();

        await registerToLobby(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'You are already registered in this lobby' }));
    });

    test('registerToLobby maps UNKNOWN_ERROR to 500 fallback', async () => {
        const session = {
            withTransaction: jest.fn(async () => { throw new Error('UNKNOWN'); }),
            endSession: jest.fn().mockResolvedValue(undefined)
        };
        mongoose.startSession.mockResolvedValue(session);

        const req = { userId: 'u1', body: { lobbyId: 'l1' } };
        const res = buildRes();

        await registerToLobby(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });

    test('getMyLobbies returns mapped lobbies', async () => {
        const populate = jest.fn().mockResolvedValue([
            { lobbyId: { _id: 'l1', name: 'Lobby 1' } },
            { lobbyId: { _id: 'l2', name: 'Lobby 2' } }
        ]);
        LobbyParticipant.find.mockReturnValue({ populate });

        const req = { userId: 'u1' };
        const res = buildRes();

        await getMyLobbies(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    test('leaveLobby maps NOT_REGISTERED to 400', async () => {
        const session = {
            withTransaction: jest.fn(async () => { throw new Error('NOT_REGISTERED'); }),
            endSession: jest.fn().mockResolvedValue(undefined)
        };
        mongoose.startSession.mockResolvedValue(session);

        const req = { userId: 'u1', body: { lobbyId: 'l1' } };
        const res = buildRes();

        await leaveLobby(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'You are not registered in this lobby' }));
    });

    test('leaveLobby maps LOBBY_NOT_FOUND to 404', async () => {
        const session = {
            withTransaction: jest.fn(async () => { throw new Error('LOBBY_NOT_FOUND'); }),
            endSession: jest.fn().mockResolvedValue(undefined)
        };
        mongoose.startSession.mockResolvedValue(session);

        const req = { userId: 'u1', body: { lobbyId: 'l1' } };
        const res = buildRes();

        await leaveLobby(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });
});
