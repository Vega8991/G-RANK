jest.mock('../../models/userModel', () => {
    const UserMock = jest.fn();
    UserMock.findOne = jest.fn();
    UserMock.findById = jest.fn();
    return UserMock;
});

jest.mock('bcryptjs', () => ({
    genSaltSync: jest.fn(() => 'salt'),
    hashSync: jest.fn(() => 'hashed-password'),
    compareSync: jest.fn()
}));

jest.mock('jsonwebtoken', () => ({
    sign: jest.fn(() => 'jwt-token')
}));

jest.mock('crypto', () => ({
    randomBytes: jest.fn(() => ({ toString: () => 'verification-token' }))
}));

jest.mock('../../services/emailService', () => ({
    sendVerificationEmail: jest.fn()
}));

const User = require('../../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendVerificationEmail } = require('../../services/emailService');
const { registerUser, loginUser, getProfile, verifyEmail } = require('../../controllers/authController');

function buildRes() {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}

describe('authController', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.JWT_SECRET = 'secret';
        process.env.JWT_EXPIRE = '1d';

        User.mockImplementation((data) => ({
            ...data,
            _id: 'user-id',
            rank: 'Bronze',
            mmr: 250,
            winRate: 0,
            winStreak: 0,
            wins: 0,
            losses: 0,
            role: 'USER',
            isEmailVerified: false,
            save: jest.fn().mockResolvedValue({
                _id: 'user-id',
                username: data.username,
                email: data.email,
                rank: 'Bronze',
                mmr: 250,
                role: 'USER'
            })
        }));
    });

    test('registerUser returns 400 when fields are missing', async () => {
        const req = { body: { username: '', email: '', password: '' } };
        const res = buildRes();

        await registerUser(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('registerUser returns 400 for invalid email', async () => {
        const req = { body: { username: 'vega', email: 'bad-email', password: '123456' } };
        const res = buildRes();

        await registerUser(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Invalid email format' }));
    });

    test('registerUser returns 400 for short password', async () => {
        const req = { body: { username: 'vega', email: 'vega@test.com', password: '123' } };
        const res = buildRes();

        await registerUser(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('registerUser creates user and sends verification email', async () => {
        const req = { body: { username: 'vega', email: 'vega@test.com', password: '123456' } };
        const res = buildRes();

        await registerUser(req, res);

        expect(bcrypt.hashSync).toHaveBeenCalled();
        expect(sendVerificationEmail).toHaveBeenCalledWith('vega@test.com', 'vega', 'verification-token');
        expect(res.status).toHaveBeenCalledWith(201);
    });

    test('loginUser returns 400 when email/password are missing', async () => {
        const req = { body: { email: '', password: '' } };
        const res = buildRes();

        await loginUser(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('loginUser returns 404 when user is not found', async () => {
        User.findOne.mockResolvedValue(null);
        const req = { body: { email: 'vega@test.com', password: '123456' } };
        const res = buildRes();

        await loginUser(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('loginUser returns 401 when password is invalid', async () => {
        User.findOne.mockResolvedValue({ password: 'hashed', isEmailVerified: true });
        bcrypt.compareSync.mockReturnValue(false);
        const req = { body: { email: 'vega@test.com', password: 'wrong-pass' } };
        const res = buildRes();

        await loginUser(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
    });

    test('loginUser returns 403 when email is not verified', async () => {
        User.findOne.mockResolvedValue({ password: 'hashed', isEmailVerified: false });
        bcrypt.compareSync.mockReturnValue(true);
        const req = { body: { email: 'vega@test.com', password: '123456' } };
        const res = buildRes();

        await loginUser(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
    });

    test('loginUser returns token and user when credentials are valid', async () => {
        User.findOne.mockResolvedValue({
            _id: 'u1',
            username: 'vega',
            email: 'vega@test.com',
            password: 'hashed',
            isEmailVerified: true,
            rank: 'Bronze',
            mmr: 250,
            winRate: 10,
            winStreak: 1,
            wins: 1,
            losses: 2,
            role: 'USER'
        });
        bcrypt.compareSync.mockReturnValue(true);

        const req = { body: { email: 'vega@test.com', password: '123456' } };
        const res = buildRes();

        await loginUser(req, res);

        expect(jwt.sign).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, token: 'jwt-token' }));
    });

    test('getProfile returns 404 when user does not exist', async () => {
        User.findById.mockResolvedValue(null);
        const req = { userId: 'u1' };
        const res = buildRes();

        await getProfile(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('getProfile returns user data when user exists', async () => {
        User.findById.mockResolvedValue({
            _id: 'u1',
            username: 'vega',
            email: 'vega@test.com',
            rank: 'Bronze',
            mmr: 250,
            winRate: 50,
            winStreak: 2,
            wins: 2,
            losses: 2,
            role: 'USER'
        });

        const req = { userId: 'u1' };
        const res = buildRes();

        await getProfile(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    test('verifyEmail returns 404 when token is invalid', async () => {
        User.findOne.mockResolvedValue(null);
        const req = { query: { token: 'bad-token' } };
        const res = buildRes();

        await verifyEmail(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('verifyEmail marks user as verified', async () => {
        const save = jest.fn().mockResolvedValue(undefined);
        User.findOne.mockResolvedValue({
            isEmailVerified: false,
            emailVerificationToken: 'good-token',
            save
        });

        const req = { query: { token: 'good-token' } };
        const res = buildRes();

        await verifyEmail(req, res);

        expect(save).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
    });
});
