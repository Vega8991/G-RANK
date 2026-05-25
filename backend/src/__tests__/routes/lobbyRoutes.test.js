jest.mock('../../controllers/lobbyController', () => ({
    createLobby: (req, res) => res.status(200).json({ success: true }),
    getAllLobbies: (req, res) => res.status(200).json({ success: true }),
    getMyCreatedLobbies: (req, res) => res.status(200).json({ success: true }),
    syncParticipantCounts: (req, res) => res.status(200).json({ success: true }),
    getLobbyById: (req, res) => res.status(200).json({ success: true }),
    updateLobbyStatus: (req, res) => res.status(200).json({ success: true })
}));

const express = require('express');
const cookieParser = require('cookie-parser');
const request = require('supertest');
const lobbyRoutes = require('../../routes/lobbyRoutes');

function buildApp() {
    const app = express();
    app.use(express.json());
    app.use(cookieParser());
    app.use('/api/lobbies', lobbyRoutes);
    return app;
}

describe('Lobby routes', () => {
    let app;

    beforeAll(() => {
        process.env.JWT_SECRET = 'test-secret';
        app = buildApp();
    });

    test('GET /api/lobbies is public', async () => {
        const res = await request(app).get('/api/lobbies');
        expect(res.status).toBe(200);
    });

    test('GET /api/lobbies/:id is public', async () => {
        const res = await request(app).get('/api/lobbies/507f1f77bcf86cd799439011');
        expect(res.status).toBe(200);
    });

    test('POST /api/lobbies/sync-counts returns 403 without token', async () => {
        const res = await request(app).post('/api/lobbies/sync-counts').send({});
        expect(res.status).toBe(403);
    });

    test('POST /api/lobbies returns 403 without token', async () => {
        const res = await request(app).post('/api/lobbies').send({});
        expect(res.status).toBe(403);
    });

    test('GET /api/lobbies/my-created returns 403 without token', async () => {
        const res = await request(app).get('/api/lobbies/my-created');
        expect(res.status).toBe(403);
    });

    test('PATCH /api/lobbies/:id/status returns 403 without token', async () => {
        const res = await request(app).patch('/api/lobbies/507f1f77bcf86cd799439011/status').send({});
        expect(res.status).toBe(403);
    });
});
