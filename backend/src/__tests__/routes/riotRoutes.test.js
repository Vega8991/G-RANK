jest.mock('../../controllers/riotController', () => ({
    linkRiotAccount: (req, res) => res.status(200).json({ success: true }),
    unlinkRiotAccount: (req, res) => res.status(200).json({ success: true }),
    getMyRiotProfile: (req, res) => res.status(200).json({ success: true }),
    getRiotProfileByRiotId: (req, res) => res.status(200).json({ success: true }),
    submitLolMatch: (req, res) => res.status(200).json({ success: true }),
    getRiotOAuthUrl: (req, res) => res.status(200).json({ success: true }),
    handleRiotOAuthCallback: (req, res) => res.status(200).json({ success: true })
}));

const express = require('express');
const cookieParser = require('cookie-parser');
const request = require('supertest');
const riotRoutes = require('../../routes/riotRoutes');

function buildApp() {
    const app = express();
    app.use(express.json());
    app.use(cookieParser());
    app.use('/api/riot', riotRoutes);
    return app;
}

describe('Riot routes', () => {
    let app;

    beforeAll(() => {
        process.env.JWT_SECRET = 'test-secret';
        app = buildApp();
    });

    test('GET /api/riot/profile/:riotId is public', async () => {
        const res = await request(app).get('/api/riot/profile/player-123');
        expect(res.status).toBe(200);
    });

    test('GET /api/riot/oauth/callback is public', async () => {
        const res = await request(app).get('/api/riot/oauth/callback');
        expect(res.status).toBe(200);
    });

    test('POST /api/riot/link returns 403 without token', async () => {
        const res = await request(app).post('/api/riot/link').send({});
        expect(res.status).toBe(403);
    });

    test('DELETE /api/riot/unlink returns 403 without token', async () => {
        const res = await request(app).delete('/api/riot/unlink');
        expect(res.status).toBe(403);
    });

    test('GET /api/riot/profile returns 403 without token', async () => {
        const res = await request(app).get('/api/riot/profile');
        expect(res.status).toBe(403);
    });

    test('POST /api/riot/submit-lol-match returns 403 without token', async () => {
        const res = await request(app).post('/api/riot/submit-lol-match').send({});
        expect(res.status).toBe(403);
    });

    test('GET /api/riot/oauth/url returns 403 without token', async () => {
        const res = await request(app).get('/api/riot/oauth/url');
        expect(res.status).toBe(403);
    });

    test('POST /api/riot/link returns 401 with invalid token', async () => {
        const res = await request(app)
            .post('/api/riot/link')
            .set('Cookie', 'token=bad-token')
            .send({});
        expect(res.status).toBe(401);
    });
});
