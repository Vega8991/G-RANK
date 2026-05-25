jest.mock('../../controllers/authController', () => ({
    registerUser: (req, res) => res.status(200).json({ success: true }),
    loginUser: (req, res) => res.status(200).json({ success: true }),
    logoutUser: (req, res) => res.status(200).json({ success: true }),
    refreshTokens: (req, res) => res.status(200).json({ success: true }),
    getProfile: (req, res) => res.status(200).json({ success: true }),
    verifyEmail: (req, res) => res.status(200).json({ success: true }),
    forgotPassword: (req, res) => res.status(200).json({ success: true }),
    resetPassword: (req, res) => res.status(200).json({ success: true }),
    getPublicProfile: (req, res) => res.status(200).json({ success: true }),
    resendVerificationEmail: (req, res) => res.status(200).json({ success: true })
}));

const express = require('express');
const cookieParser = require('cookie-parser');
const request = require('supertest');
const authRoutes = require('../../routes/authRoutes');

function buildApp() {
    const app = express();
    app.use(express.json());
    app.use(cookieParser());
    app.use('/api/auth', authRoutes);
    return app;
}

describe('Auth routes', () => {
    let app;

    beforeAll(() => {
        process.env.JWT_SECRET = 'test-secret';
        app = buildApp();
    });

    test('POST /api/auth/register is reachable', async () => {
        const res = await request(app).post('/api/auth/register').send({});
        expect(res.status).toBe(200);
    });

    test('POST /api/auth/login is reachable', async () => {
        const res = await request(app).post('/api/auth/login').send({});
        expect(res.status).toBe(200);
    });

    test('POST /api/auth/logout is reachable', async () => {
        const res = await request(app).post('/api/auth/logout').send({});
        expect(res.status).toBe(200);
    });

    test('GET /api/auth/verify-email is reachable', async () => {
        const res = await request(app).get('/api/auth/verify-email?token=abc');
        expect(res.status).toBe(200);
    });

    test('POST /api/auth/forgot-password is reachable', async () => {
        const res = await request(app).post('/api/auth/forgot-password').send({});
        expect(res.status).toBe(200);
    });

    test('POST /api/auth/reset-password is reachable', async () => {
        const res = await request(app).post('/api/auth/reset-password').send({});
        expect(res.status).toBe(200);
    });

    test('GET /api/auth/users/:username is reachable without auth', async () => {
        const res = await request(app).get('/api/auth/users/testuser');
        expect(res.status).toBe(200);
    });

    test('POST /api/auth/resend-verification is reachable', async () => {
        const res = await request(app).post('/api/auth/resend-verification').send({});
        expect(res.status).toBe(200);
    });

    test('GET /api/auth/profile returns 403 without token', async () => {
        const res = await request(app).get('/api/auth/profile');
        expect(res.status).toBe(403);
    });

    test('GET /api/auth/profile returns 401 with invalid token', async () => {
        const res = await request(app)
            .get('/api/auth/profile')
            .set('Cookie', 'token=invalid-token');
        expect(res.status).toBe(401);
    });
});
