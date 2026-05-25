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
const Lobby = require('../../models/lobbyModel');
const LobbyParticipant = require('../../models/lobbyParticipantModel');
const User = require('../../models/userModel');
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

    test('registerToLobby succeeds and returns 201', async () => {
        const session = {
            withTransaction: jest.fn(async (fn) => { await fn(); }),
            endSession: jest.fn().mockResolvedValue(undefined)
        };
        mongoose.startSession.mockResolvedValue(session);

        const lobbyObj = {
            _id: 'l1',
            status: 'open',
            registrationDeadline: new Date(Date.now() + 3600000),
            maxParticipants: 10,
            currentParticipants: 1,
            save: jest.fn().mockResolvedValue(undefined)
        };

        const sessionFn = jest.fn().mockReturnValue(lobbyObj);
        Lobby.findById.mockReturnValue({ session: sessionFn });
        LobbyParticipant.findOne.mockReturnValue({ session: jest.fn().mockResolvedValue(null) });
        User.findById.mockReturnValue({ session: jest.fn().mockResolvedValue({ _id: 'u1', mmr: 250 }) });
        Lobby.findOneAndUpdate.mockResolvedValue({ _id: 'l1', currentParticipants: 2 });

        const newParticipant = { _id: 'p1', lobbyId: 'l1', userId: 'u1' };
        LobbyParticipant.create.mockResolvedValue([newParticipant]);

        const req = { userId: 'u1', body: { lobbyId: 'l1' } };
        const res = buildRes();

        await registerToLobby(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
    });

    test('leaveLobby succeeds and returns 200', async () => {
        const session = {
            withTransaction: jest.fn(async (fn) => { await fn(); }),
            endSession: jest.fn().mockResolvedValue(undefined)
        };
        mongoose.startSession.mockResolvedValue(session);

        const lobbyObj = {
            _id: 'l1',
            status: 'open',
            save: jest.fn().mockResolvedValue(undefined)
        };

        Lobby.findById.mockReturnValue({ session: jest.fn().mockResolvedValue(lobbyObj) });
        LobbyParticipant.findOneAndDelete.mockReturnValue({ session: jest.fn().mockResolvedValue({ _id: 'p1' }) });
        Lobby.findByIdAndUpdate.mockResolvedValue({});

        const req = { userId: 'u1', body: { lobbyId: 'l1' } };
        const res = buildRes();

        await leaveLobby(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('getMyLobbies returns 500 on error', async () => {
        LobbyParticipant.find.mockReturnValue({
            populate: jest.fn().mockRejectedValue(new Error('db error'))
        });

        const req = { userId: 'u1' };
        const res = buildRes();

        await getMyLobbies(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});
