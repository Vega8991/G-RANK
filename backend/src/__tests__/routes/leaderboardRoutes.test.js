jest.mock('../../controllers/leaderboardController', () => ({
    getLeaderboard: (req, res) => res.status(200).json({ success: true })
}));

const express = require('express');
const cookieParser = require('cookie-parser');
const request = require('supertest');
const leaderboardRoutes = require('../../routes/leaderboardRoutes');

function buildApp() {
    const app = express();
    app.use(express.json());
    app.use(cookieParser());
    app.use('/api/leaderboard', leaderboardRoutes);
    return app;
}

describe('Leaderboard routes', () => {
    let app;

    beforeAll(() => {
        app = buildApp();
    });

    test('GET /api/leaderboard is public', async () => {
        const res = await request(app).get('/api/leaderboard');
        expect(res.status).toBe(200);
    });

    test('GET /api/leaderboard returns JSON', async () => {
        const res = await request(app).get('/api/leaderboard');
        expect(res.headers['content-type']).toMatch(/json/);
    });
});
