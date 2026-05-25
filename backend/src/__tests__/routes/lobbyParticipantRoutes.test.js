jest.mock('../../controllers/lobbyParticipantController', () => ({
    registerToLobby: (req, res) => res.status(200).json({ success: true }),
    leaveLobby: (req, res) => res.status(200).json({ success: true }),
    getMyLobbies: (req, res) => res.status(200).json({ success: true })
}));

const express = require('express');
const cookieParser = require('cookie-parser');
const request = require('supertest');
const lobbyParticipantRoutes = require('../../routes/lobbyParticipantRoutes');

function buildApp() {
    const app = express();
    app.use(express.json());
    app.use(cookieParser());
    app.use('/api/lobby-participants', lobbyParticipantRoutes);
    return app;
}

describe('LobbyParticipant routes', () => {
    let app;

    beforeAll(() => {
        process.env.JWT_SECRET = 'test-secret';
        app = buildApp();
    });

    test('POST /api/lobby-participants/register returns 403 without token', async () => {
        const res = await request(app).post('/api/lobby-participants/register').send({});
        expect(res.status).toBe(403);
    });

    test('POST /api/lobby-participants/leave returns 403 without token', async () => {
        const res = await request(app).post('/api/lobby-participants/leave').send({});
        expect(res.status).toBe(403);
    });

    test('GET /api/lobby-participants/my-lobbies returns 403 without token', async () => {
        const res = await request(app).get('/api/lobby-participants/my-lobbies');
        expect(res.status).toBe(403);
    });

    test('POST /api/lobby-participants/register returns 401 with invalid token', async () => {
        const res = await request(app)
            .post('/api/lobby-participants/register')
            .set('Cookie', 'token=bad-token')
            .send({});
        expect(res.status).toBe(401);
    });
});
