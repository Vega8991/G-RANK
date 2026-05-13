jest.mock('../../controllers/matchResultController', () => ({
    submitReplay: (req, res) => res.status(200).json({ success: true }),
    getLobbyResults: (req, res) => res.status(200).json({ success: true })
}));

const express = require('express');
const cookieParser = require('cookie-parser');
const request = require('supertest');
const matchResultRoutes = require('../../routes/matchResultRoutes');

function buildApp() {
    const app = express();
    app.use(express.json());
    app.use(cookieParser());
    app.use('/api/match-results', matchResultRoutes);
    return app;
}

describe('MatchResult routes', () => {
    let app;

    beforeAll(() => {
        process.env.JWT_SECRET = 'test-secret';
        app = buildApp();
    });

    test('GET /api/match-results/lobby/:lobbyId is public', async () => {
        const res = await request(app).get('/api/match-results/lobby/507f1f77bcf86cd799439011');
        expect(res.status).toBe(200);
    });

    test('POST /api/match-results/submit-replay returns 403 without token', async () => {
        const res = await request(app).post('/api/match-results/submit-replay').send({});
        expect(res.status).toBe(403);
    });

    test('POST /api/match-results/submit-replay returns 401 with invalid token', async () => {
        const res = await request(app)
            .post('/api/match-results/submit-replay')
            .set('Cookie', 'token=bad-token')
            .send({});
        expect(res.status).toBe(401);
    });
});
