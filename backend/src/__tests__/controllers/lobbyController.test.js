jest.mock('../../models/lobbyModel', () => ({
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findOneAndUpdate: jest.fn()
}));

jest.mock('../../models/lobbyParticipantModel', () => ({
    countDocuments: jest.fn()
}));

const Lobby = require('../../models/lobbyModel');
const LobbyParticipant = require('../../models/lobbyParticipantModel');
const {
    createLobby,
    getAllLobbies,
    getLobbyById,
    getMyCreatedLobbies,
    updateLobbyStatus,
    syncParticipantCounts
} = require('../../controllers/lobbyController');

function buildRes() {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}

describe('lobbyController', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('createLobby returns 400 when name/description are missing', async () => {
        const req = { userId: 'u1', body: {} };
        const res = buildRes();

        await createLobby(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('createLobby returns 400 when dates are missing', async () => {
        const req = { userId: 'u1', body: { name: 'Lobby', description: 'Desc' } };
        const res = buildRes();

        await createLobby(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('createLobby returns 400 for invalid registration date', async () => {
        const req = {
            userId: 'u1',
            body: {
                name: 'Lobby',
                description: 'Desc',
                registrationDeadline: 'invalid-date',
                matchDateTime: '2026-05-12T10:00:00.000Z'
            }
        };
        const res = buildRes();

        await createLobby(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('createLobby returns 400 when registration deadline is in the past', async () => {
        const past = new Date(Date.now() - 60000).toISOString();
        const future = new Date(Date.now() + 3600000).toISOString();
        const req = {
            userId: 'u1',
            body: {
                name: 'Lobby',
                description: 'Desc',
                registrationDeadline: past,
                matchDateTime: future
            }
        };
        const res = buildRes();

        await createLobby(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('createLobby returns 201 when data is valid', async () => {
        const registration = new Date(Date.now() + 3600000).toISOString();
        const match = new Date(Date.now() + 7200000).toISOString();
        const req = {
            userId: 'u1',
            body: {
                name: 'Lobby',
                description: 'Desc',
                registrationDeadline: registration,
                matchDateTime: match,
                maxParticipants: 4,
                prizePool: '$50'
            }
        };
        const res = buildRes();

        Lobby.create.mockResolvedValue({ _id: 'l1', name: 'Lobby' });

        await createLobby(req, res);

        expect(Lobby.create).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(201);
    });

    test('getAllLobbies returns lobby list', async () => {
        const req = {};
        const res = buildRes();

        const populate = jest.fn().mockResolvedValue([{ _id: 'l1' }]);
        Lobby.find.mockReturnValue({ populate });

        await getAllLobbies(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    test('getLobbyById returns 404 when lobby does not exist', async () => {
        const req = { params: { id: 'l1' } };
        const res = buildRes();

        const populate = jest.fn().mockResolvedValue(null);
        Lobby.findById.mockReturnValue({ populate });

        await getLobbyById(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('getLobbyById returns lobby when found', async () => {
        const req = { params: { id: 'l1' } };
        const res = buildRes();

        const populate = jest.fn().mockResolvedValue({ _id: 'l1' });
        Lobby.findById.mockReturnValue({ populate });

        await getLobbyById(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('getMyCreatedLobbies returns user lobbies', async () => {
        const req = { userId: 'u1' };
        const res = buildRes();

        const sort = jest.fn().mockResolvedValue([{ _id: 'l1' }]);
        Lobby.find.mockReturnValue({ sort });

        await getMyCreatedLobbies(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(Lobby.find).toHaveBeenCalledWith({ createdBy: 'u1' });
    });

    test('updateLobbyStatus returns 404 when lobby does not exist', async () => {
        const req = { userId: 'u1', params: { id: 'l1' }, body: { status: 'completed' } };
        const res = buildRes();

        Lobby.findById.mockResolvedValue(null);

        await updateLobbyStatus(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('updateLobbyStatus returns 403 when user is not creator', async () => {
        const req = { userId: 'u1', params: { id: 'l1' }, body: { status: 'completed' } };
        const res = buildRes();

        Lobby.findById.mockResolvedValue({ createdBy: { toString: () => 'other-user' } });

        await updateLobbyStatus(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
    });

    test('updateLobbyStatus returns 400 for invalid status', async () => {
        const req = { userId: 'u1', params: { id: 'l1' }, body: { status: 'wrong' } };
        const res = buildRes();

        Lobby.findById.mockResolvedValue({ createdBy: { toString: () => 'u1' } });

        await updateLobbyStatus(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('updateLobbyStatus returns 200 when status is updated', async () => {
        const save = jest.fn().mockResolvedValue(undefined);
        const req = { userId: 'u1', params: { id: 'l1' }, body: { status: 'completed' } };
        const res = buildRes();

        const lobby = { createdBy: { toString: () => 'u1' }, status: 'open', save };
        Lobby.findById.mockResolvedValue(lobby);

        await updateLobbyStatus(req, res);

        expect(save).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('syncParticipantCounts updates count when values differ', async () => {
        const req = {};
        const res = buildRes();

        const save1 = jest.fn().mockResolvedValue(undefined);
        const save2 = jest.fn().mockResolvedValue(undefined);
        const lobbies = [
            { _id: 'l1', currentParticipants: 0, save: save1 },
            { _id: 'l2', currentParticipants: 2, save: save2 }
        ];
        Lobby.find.mockResolvedValue(lobbies);
        LobbyParticipant.countDocuments
            .mockResolvedValueOnce(1)
            .mockResolvedValueOnce(2);

        await syncParticipantCounts(req, res);

        expect(save1).toHaveBeenCalled();
        expect(save2).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
    });
});
