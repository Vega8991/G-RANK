jest.mock('../../models/userModel', () => {
    const UserMock = jest.fn();
    UserMock.find = jest.fn();
    UserMock.findByIdAndUpdate = jest.fn();
    UserMock.findByIdAndDelete = jest.fn();
    UserMock.countDocuments = jest.fn();
    return UserMock;
});

jest.mock('../../models/lobbyModel', () => ({
    find: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    countDocuments: jest.fn()
}));

jest.mock('../../utils/passwordUtils', () => ({
    hashPassword: jest.fn(() => 'hashed-password')
}));

const User = require('../../models/userModel');
const Lobby = require('../../models/lobbyModel');
const {
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
    adminGetAllLobbies,
    adminUpdateLobby,
    adminDeleteLobby,
    getStats
} = require('../../controllers/adminController');

function buildRes() {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}

describe('adminController', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('getAllUsers returns 200 with users', async () => {
        const sort = jest.fn().mockResolvedValue([{ _id: 'u1' }]);
        User.find.mockReturnValue({ sort });

        const req = {};
        const res = buildRes();

        await getAllUsers(req, res);

        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    test('createUser returns 400 when fields missing', async () => {
        const req = { body: { username: '', email: '', password: '' } };
        const res = buildRes();

        await createUser(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('createUser returns 201 with valid data', async () => {
        const savedUser = {
            _id: 'u1',
            username: 'admin',
            email: 'admin@test.com',
            role: 'USER',
            rank: 'Bronze',
            mmr: 250,
            status: 'active',
            createdAt: new Date()
        };
        const save = jest.fn().mockResolvedValue(savedUser);
        User.mockImplementation(() => ({ ...savedUser, save }));

        const req = { body: { username: 'admin', email: 'admin@test.com', password: 'pass123' } };
        const res = buildRes();

        await createUser(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
    });

    test('updateUser returns 404 when user not found', async () => {
        User.findByIdAndUpdate.mockResolvedValue(null);

        const req = { params: { id: 'u1' }, body: {} };
        const res = buildRes();

        await updateUser(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('updateUser returns 200 when user found', async () => {
        User.findByIdAndUpdate.mockResolvedValue({ _id: 'u1', username: 'admin' });

        const req = { params: { id: 'u1' }, body: { username: 'admin' } };
        const res = buildRes();

        await updateUser(req, res);

        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    test('deleteUser returns 404 when user not found', async () => {
        User.findByIdAndDelete.mockResolvedValue(null);

        const req = { params: { id: 'u1' } };
        const res = buildRes();

        await deleteUser(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('deleteUser returns 200 when deleted', async () => {
        User.findByIdAndDelete.mockResolvedValue({ _id: 'u1' });

        const req = { params: { id: 'u1' } };
        const res = buildRes();

        await deleteUser(req, res);

        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    test('adminGetAllLobbies returns 200', async () => {
        const sort = jest.fn().mockResolvedValue([{ _id: 'l1' }]);
        const populate = jest.fn().mockReturnValue({ sort });
        Lobby.find.mockReturnValue({ populate });

        const req = {};
        const res = buildRes();

        await adminGetAllLobbies(req, res);

        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    test('adminUpdateLobby returns 404 when lobby not found', async () => {
        const populate = jest.fn().mockResolvedValue(null);
        Lobby.findByIdAndUpdate.mockReturnValue({ populate });

        const req = { params: { id: 'l1' }, body: {} };
        const res = buildRes();

        await adminUpdateLobby(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('adminUpdateLobby returns 200 when updated', async () => {
        const populate = jest.fn().mockResolvedValue({ _id: 'l1', name: 'Lobby' });
        Lobby.findByIdAndUpdate.mockReturnValue({ populate });

        const req = { params: { id: 'l1' }, body: { name: 'Lobby' } };
        const res = buildRes();

        await adminUpdateLobby(req, res);

        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    test('adminDeleteLobby returns 404 when lobby not found', async () => {
        Lobby.findByIdAndDelete.mockResolvedValue(null);

        const req = { params: { id: 'l1' } };
        const res = buildRes();

        await adminDeleteLobby(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('adminDeleteLobby returns 200 when deleted', async () => {
        Lobby.findByIdAndDelete.mockResolvedValue({ _id: 'l1' });

        const req = { params: { id: 'l1' } };
        const res = buildRes();

        await adminDeleteLobby(req, res);

        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    test('getStats returns 200 with counts', async () => {
        User.countDocuments
            .mockResolvedValueOnce(10)
            .mockResolvedValueOnce(3);
        Lobby.countDocuments
            .mockResolvedValueOnce(5)
            .mockResolvedValueOnce(2);

        const req = {};
        const res = buildRes();

        await getStats(req, res);

        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            stats: expect.objectContaining({
                totalUsers: 10,
                totalLobbies: 5
            })
        }));
    });

    test('getAllUsers returns 500 on DB error', async () => {
        User.find.mockReturnValue({ sort: jest.fn().mockRejectedValue(new Error('db error')) });
        const req = {};
        const res = buildRes();

        await getAllUsers(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });

    test('createUser returns 400 for duplicate email', async () => {
        const save = jest.fn().mockRejectedValue({ code: 11000, keyValue: { email: 'x' } });
        User.mockImplementation(() => ({ save }));
        const req = { body: { username: 'admin', email: 'admin@test.com', password: 'pass123' } };
        const res = buildRes();

        await createUser(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Email already in use' }));
    });

    test('updateUser returns 400 on DB error', async () => {
        User.findByIdAndUpdate.mockRejectedValue(new Error('db error'));
        const req = { params: { id: 'u1' }, body: {} };
        const res = buildRes();

        await updateUser(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('deleteUser returns 500 on DB error', async () => {
        User.findByIdAndDelete.mockRejectedValue(new Error('db error'));
        const req = { params: { id: 'u1' } };
        const res = buildRes();

        await deleteUser(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });

    test('adminGetAllLobbies returns 500 on DB error', async () => {
        Lobby.find.mockReturnValue({ populate: jest.fn().mockReturnValue({ sort: jest.fn().mockRejectedValue(new Error('db error')) }) });
        const req = {};
        const res = buildRes();

        await adminGetAllLobbies(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });

    test('adminUpdateLobby returns 400 on DB error', async () => {
        Lobby.findByIdAndUpdate.mockReturnValue({ populate: jest.fn().mockRejectedValue(new Error('db error')) });
        const req = { params: { id: 'l1' }, body: {} };
        const res = buildRes();

        await adminUpdateLobby(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('adminDeleteLobby returns 500 on DB error', async () => {
        Lobby.findByIdAndDelete.mockRejectedValue(new Error('db error'));
        const req = { params: { id: 'l1' } };
        const res = buildRes();

        await adminDeleteLobby(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });

    test('getStats returns 500 on DB error', async () => {
        User.countDocuments.mockRejectedValue(new Error('db error'));
        const req = {};
        const res = buildRes();

        await getStats(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});
