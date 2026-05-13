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
    sign: jest.fn(() => 'jwt-token'),
    decode: jest.fn(() => ({ exp: Math.floor(Date.now() / 1000) + 86400 }))
}));

jest.mock('crypto', () => ({
    randomBytes: jest.fn(() => ({ toString: () => 'verification-token' }))
}));

jest.mock('../../services/emailService', () => ({
    sendVerificationEmail: jest.fn(),
    sendPasswordResetEmail: jest.fn()
}));

const User = require('../../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../../services/emailService');
const { registerUser, loginUser, logoutUser, getProfile, verifyEmail, forgotPassword, resendVerificationEmail, resetPassword, getPublicProfile } = require('../../controllers/authController');

function buildRes() {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.cookie = jest.fn().mockReturnValue(res);
    res.clearCookie = jest.fn().mockReturnValue(res);
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

    test('loginUser returns 401 when user is not found', async () => {
        User.findOne.mockResolvedValue(null);
        const req = { body: { email: 'vega@test.com', password: '123456' } };
        const res = buildRes();

        await loginUser(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Invalid credentials' }));
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
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, message: 'Login successful' }));
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

    test('logoutUser clears cookies and returns 200', async () => {
        const req = {};
        const res = buildRes();

        await logoutUser(req, res);

        expect(res.clearCookie).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('forgotPassword returns 200 even when user not found', async () => {
        User.findOne.mockResolvedValue(null);
        const req = { body: { email: 'x@x.com' } };
        const res = buildRes();

        await forgotPassword(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('forgotPassword sends reset email when user found', async () => {
        const save = jest.fn().mockResolvedValue(undefined);
        User.findOne.mockResolvedValue({
            _id: 'u1',
            email: 'x@x.com',
            username: 'xuser',
            save
        });
        const req = { body: { email: 'x@x.com' } };
        const res = buildRes();

        await forgotPassword(req, res);

        expect(sendPasswordResetEmail).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('resendVerificationEmail returns 400 when email already verified', async () => {
        User.findOne.mockResolvedValue({ isEmailVerified: true });
        const req = { body: { email: 'x@x.com' } };
        const res = buildRes();

        await resendVerificationEmail(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('resendVerificationEmail sends new token when unverified', async () => {
        const save = jest.fn().mockResolvedValue(undefined);
        User.findOne.mockResolvedValue({
            email: 'x@x.com',
            username: 'xuser',
            isEmailVerified: false,
            save
        });
        const req = { body: { email: 'x@x.com' } };
        const res = buildRes();

        await resendVerificationEmail(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('registerUser returns 500 when email fails to send', async () => {
        sendVerificationEmail.mockRejectedValue(new Error('smtp error'));
        const req = { body: { username: 'vega', email: 'vega@test.com', password: '123456' } };
        const res = buildRes();

        await registerUser(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });

    test('registerUser returns 400 for duplicate email', async () => {
        User.mockImplementation(() => ({
            save: jest.fn().mockRejectedValue({ code: 11000, keyValue: { email: 'x@x.com' } })
        }));
        const req = { body: { username: 'vega', email: 'x@x.com', password: '123456' } };
        const res = buildRes();

        await registerUser(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('email') }));
    });

    test('registerUser returns 400 for duplicate username', async () => {
        User.mockImplementation(() => ({
            save: jest.fn().mockRejectedValue({ code: 11000, keyValue: { username: 'x' } })
        }));
        const req = { body: { username: 'x', email: 'x@x.com', password: '123456' } };
        const res = buildRes();

        await registerUser(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('loginUser returns 500 on unexpected error', async () => {
        User.findOne.mockRejectedValue(new Error('db error'));
        const req = { body: { email: 'vega@test.com', password: '123456' } };
        const res = buildRes();

        await loginUser(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });

    test('getProfile returns 500 on DB error', async () => {
        User.findById.mockRejectedValue(new Error('db error'));
        const req = { userId: 'u1' };
        const res = buildRes();

        await getProfile(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });

    test('getPublicProfile returns 404 when user not found', async () => {
        User.findOne.mockResolvedValue(null);
        const req = { params: { username: 'vega' } };
        const res = buildRes();

        await getPublicProfile(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('getPublicProfile returns 200 with user data', async () => {
        User.findOne.mockResolvedValue({
            _id: 'u1',
            username: 'vega',
            rank: 'Bronze',
            mmr: 250,
            wins: 1,
            losses: 0,
            winRate: 100,
            winStreak: 1,
            totalMatches: 1,
            role: 'USER',
            status: 'active',
            joinDate: new Date()
        });
        const req = { params: { username: 'vega' } };
        const res = buildRes();

        await getPublicProfile(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('forgotPassword returns 400 when email field missing', async () => {
        const req = { body: {} };
        const res = buildRes();

        await forgotPassword(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('forgotPassword returns 500 on DB error', async () => {
        User.findOne.mockRejectedValue(new Error('db error'));
        const req = { body: { email: 'x@x.com' } };
        const res = buildRes();

        await forgotPassword(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });

    test('resetPassword returns 400 when token or password missing', async () => {
        const req = { body: {} };
        const res = buildRes();

        await resetPassword(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('resetPassword returns 400 for short password', async () => {
        const req = { body: { token: 'tok', password: '123' } };
        const res = buildRes();

        await resetPassword(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('resetPassword returns 400 for invalid/expired token', async () => {
        User.findOne.mockResolvedValue(null);
        const req = { body: { token: 'bad-token', password: '123456' } };
        const res = buildRes();

        await resetPassword(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('resetPassword returns 200 on success', async () => {
        const save = jest.fn().mockResolvedValue(undefined);
        User.findOne.mockResolvedValue({
            password: 'old-hash',
            passwordResetToken: 'tok',
            passwordResetExpires: new Date(Date.now() + 3600000),
            save
        });
        const req = { body: { token: 'tok', password: '123456' } };
        const res = buildRes();

        await resetPassword(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
    });
});
