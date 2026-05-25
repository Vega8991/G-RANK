jest.mock('../../controllers/adminController', () => ({
    getStats: (req, res) => res.status(200).json({ success: true }),
    getAllUsers: (req, res) => res.status(200).json({ success: true }),
    createUser: (req, res) => res.status(200).json({ success: true }),
    updateUser: (req, res) => res.status(200).json({ success: true }),
    deleteUser: (req, res) => res.status(200).json({ success: true }),
    adminGetAllLobbies: (req, res) => res.status(200).json({ success: true }),
    adminUpdateLobby: (req, res) => res.status(200).json({ success: true }),
    adminDeleteLobby: (req, res) => res.status(200).json({ success: true })
}));

const express = require('express');
const cookieParser = require('cookie-parser');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const adminRoutes = require('../../routes/adminRoutes');

function buildApp() {
    const app = express();
    app.use(express.json());
    app.use(cookieParser());
    app.use('/api/admin', adminRoutes);
    return app;
}

function makeToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET);
}

describe('Admin routes', () => {
    let app;

    beforeAll(() => {
        process.env.JWT_SECRET = 'test-secret';
        app = buildApp();
    });

    test('GET /api/admin/stats returns 403 without token', async () => {
        const res = await request(app).get('/api/admin/stats');
        expect(res.status).toBe(403);
    });

    test('GET /api/admin/users returns 403 without token', async () => {
        const res = await request(app).get('/api/admin/users');
        expect(res.status).toBe(403);
    });

    test('POST /api/admin/users returns 403 without token', async () => {
        const res = await request(app).post('/api/admin/users').send({});
        expect(res.status).toBe(403);
    });

    test('PATCH /api/admin/users/:id returns 403 without token', async () => {
        const res = await request(app).patch('/api/admin/users/507f1f77bcf86cd799439011').send({});
        expect(res.status).toBe(403);
    });

    test('DELETE /api/admin/users/:id returns 403 without token', async () => {
        const res = await request(app).delete('/api/admin/users/507f1f77bcf86cd799439011');
        expect(res.status).toBe(403);
    });

    test('GET /api/admin/lobbies returns 403 without token', async () => {
        const res = await request(app).get('/api/admin/lobbies');
        expect(res.status).toBe(403);
    });

    test('PATCH /api/admin/lobbies/:id returns 403 without token', async () => {
        const res = await request(app).patch('/api/admin/lobbies/507f1f77bcf86cd799439011').send({});
        expect(res.status).toBe(403);
    });

    test('DELETE /api/admin/lobbies/:id returns 403 without token', async () => {
        const res = await request(app).delete('/api/admin/lobbies/507f1f77bcf86cd799439011');
        expect(res.status).toBe(403);
    });

    test('GET /api/admin/stats returns 403 when user role is USER (not ADMIN)', async () => {
        const token = makeToken({ userId: 'u1', role: 'USER' });
        const res = await request(app)
            .get('/api/admin/stats')
            .set('Cookie', `token=${token}`);
        expect(res.status).toBe(403);
    });

    test('GET /api/admin/stats returns 200 when user role is ADMIN', async () => {
        const token = makeToken({ userId: 'u1', role: 'ADMIN' });
        const res = await request(app)
            .get('/api/admin/stats')
            .set('Cookie', `token=${token}`);
        expect(res.status).toBe(200);
    });

    test('GET /api/admin/users returns 200 for ADMIN', async () => {
        const token = makeToken({ userId: 'u1', role: 'ADMIN' });
        const res = await request(app)
            .get('/api/admin/users')
            .set('Cookie', `token=${token}`);
        expect(res.status).toBe(200);
    });

    test('DELETE /api/admin/lobbies/:id returns 200 for ADMIN', async () => {
        const token = makeToken({ userId: 'u1', role: 'ADMIN' });
        const res = await request(app)
            .delete('/api/admin/lobbies/507f1f77bcf86cd799439011')
            .set('Cookie', `token=${token}`);
        expect(res.status).toBe(200);
    });
});
