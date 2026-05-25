jest.mock('../../models/userModel', () => ({
    findById: jest.fn(),
    findOne: jest.fn(),
    findByIdAndUpdate: jest.fn()
}));

jest.mock('../../services/riotService', () => ({
    getClusterFromPlatform: jest.fn(() => 'europe'),
    getAccountByRiotId: jest.fn(),
    getFullLolProfile: jest.fn(),
    buildCachedProfile: jest.fn(() => ({ tier: 'GOLD' }))
}));

jest.mock('axios', () => ({ post: jest.fn(), get: jest.fn() }));

jest.mock('mongoose', () => ({ startSession: jest.fn() }));

jest.mock('../../services/mmrService', () => ({
    calculateMMRChange: jest.fn(),
    updateUserStats: jest.fn()
}));

jest.mock('../../models/lobbyModel', () => ({ findById: jest.fn() }));

jest.mock('../../models/lobbyParticipantModel', () => ({ findOne: jest.fn(), find: jest.fn() }));

jest.mock('../../models/matchResultModel', () => ({ create: jest.fn() }));

const User = require('../../models/userModel');
const riotService = require('../../services/riotService');
const axios = require('axios');
const mongoose = require('mongoose');
const {
    linkRiotAccount,
    unlinkRiotAccount,
    getMyRiotProfile,
    getRiotProfileByRiotId,
    getRiotOAuthUrl,
    handleRiotOAuthCallback,
    submitLolMatch
} = require('../../controllers/riotController');

function buildRes() {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.redirect = jest.fn().mockReturnValue(res);
    return res;
}

describe('riotController', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        delete process.env.RIOT_CLIENT_ID;
        delete process.env.RIOT_REDIRECT_URI;
    });

    describe('linkRiotAccount', () => {
        test('returns 400 when gameName/tagLine/platform missing', async () => {
            const req = { userId: 'u1', body: {} };
            const res = buildRes();
            await linkRiotAccount(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        test('returns 400 when platform is invalid', async () => {
            const req = { userId: 'u1', body: { gameName: 'V', tagLine: 'EUW', platform: 'badplatform' } };
            const res = buildRes();
            await linkRiotAccount(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        test('returns 404 when Riot API returns 404', async () => {
            riotService.getAccountByRiotId.mockRejectedValue({ response: { status: 404 } });
            const req = { userId: 'u1', body: { gameName: 'V', tagLine: 'EUW', platform: 'euw1' } };
            const res = buildRes();
            await linkRiotAccount(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });

        test('returns 502 when Riot API fails with non-404 error', async () => {
            riotService.getAccountByRiotId.mockRejectedValue({ response: { status: 500 } });
            const req = { userId: 'u1', body: { gameName: 'V', tagLine: 'EUW', platform: 'euw1' } };
            const res = buildRes();
            await linkRiotAccount(req, res);
            expect(res.status).toHaveBeenCalledWith(502);
        });

        test('returns 409 when Riot account already linked to another user', async () => {
            riotService.getAccountByRiotId.mockResolvedValue({ puuid: 'p1', gameName: 'V', tagLine: 'EUW' });
            User.findOne.mockResolvedValue({ _id: 'other-user' });
            const req = { userId: 'u1', body: { gameName: 'V', tagLine: 'EUW', platform: 'euw1' } };
            const res = buildRes();
            await linkRiotAccount(req, res);
            expect(res.status).toHaveBeenCalledWith(409);
        });

        test('returns 200 when linking succeeds', async () => {
            riotService.getAccountByRiotId.mockResolvedValue({ puuid: 'p1', gameName: 'V', tagLine: 'EUW' });
            User.findOne.mockResolvedValue(null);
            User.findByIdAndUpdate.mockResolvedValue({});
            riotService.getFullLolProfile.mockResolvedValue({});
            const req = { userId: 'u1', body: { gameName: 'V', tagLine: 'EUW', platform: 'euw1' } };
            const res = buildRes();
            await linkRiotAccount(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('unlinkRiotAccount', () => {
        test('returns 200 when successful', async () => {
            User.findByIdAndUpdate.mockResolvedValue({});
            const req = { userId: 'u1' };
            const res = buildRes();
            await unlinkRiotAccount(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('getMyRiotProfile', () => {
        test('returns 404 when user has no riotPuuid', async () => {
            User.findById.mockResolvedValue({ riotPuuid: null });
            const req = { userId: 'u1' };
            const res = buildRes();
            await getMyRiotProfile(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });

        test('returns 200 when profile fetched successfully', async () => {
            User.findById.mockResolvedValue({ riotPuuid: 'p1', riotPlatform: 'na1' });
            riotService.getFullLolProfile.mockResolvedValue({});
            User.findByIdAndUpdate.mockResolvedValue({});
            const req = { userId: 'u1' };
            const res = buildRes();
            await getMyRiotProfile(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('getRiotProfileByRiotId', () => {
        test('returns 400 when riotId has no dash', async () => {
            const req = { params: { riotId: 'nodash' }, query: {} };
            const res = buildRes();
            await getRiotProfileByRiotId(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        test('returns 200 when valid', async () => {
            riotService.getAccountByRiotId.mockResolvedValue({ puuid: 'p1' });
            riotService.getFullLolProfile.mockResolvedValue({});
            const req = { params: { riotId: 'Vega-EUW' }, query: {} };
            const res = buildRes();
            await getRiotProfileByRiotId(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('getRiotOAuthUrl', () => {
        test('returns 400 for invalid platform', async () => {
            const req = { query: { platform: 'badplatform' }, userId: 'u1' };
            const res = buildRes();
            await getRiotOAuthUrl(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        test('returns 503 when RIOT_CLIENT_ID or RIOT_REDIRECT_URI env vars missing', async () => {
            const req = { query: { platform: 'na1' }, userId: 'u1' };
            const res = buildRes();
            await getRiotOAuthUrl(req, res);
            expect(res.status).toHaveBeenCalledWith(503);
        });

        test('returns 200 with url when configured', async () => {
            process.env.RIOT_CLIENT_ID = 'cid';
            process.env.RIOT_REDIRECT_URI = 'http://cb';
            const req = { query: { platform: 'na1' }, userId: 'u1' };
            const res = buildRes();
            await getRiotOAuthUrl(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ url: expect.any(String) }));
        });
    });

    describe('handleRiotOAuthCallback', () => {
        test('redirects with riot_error=<error> when req.query.error is set', async () => {
            const req = { query: { error: 'access_denied' } };
            const res = buildRes();
            await handleRiotOAuthCallback(req, res);
            expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining('riot_error=access_denied'));
        });

        test('redirects with riot_error=missing_params when code/state missing', async () => {
            const req = { query: {} };
            const res = buildRes();
            await handleRiotOAuthCallback(req, res);
            expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining('riot_error=missing_params'));
        });

        test('redirects with riot_error=invalid_state when state is invalid base64', async () => {
            const req = { query: { code: 'abc', state: '!!!invalid!!!' } };
            const res = buildRes();
            await handleRiotOAuthCallback(req, res);
            expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining('riot_error=invalid_state'));
        });

        test('redirects with riot_error=token_exchange_failed when axios.post throws', async () => {
            const validState = Buffer.from(JSON.stringify({ userId: 'u1', platform: 'na1' })).toString('base64url');
            axios.post.mockRejectedValue(new Error('network error'));
            const req = { query: { code: 'abc', state: validState } };
            const res = buildRes();
            await handleRiotOAuthCallback(req, res);
            expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining('riot_error=token_exchange_failed'));
        });

        test('redirects with riot_error=account_fetch_failed when axios.get throws', async () => {
            const validState = Buffer.from(JSON.stringify({ userId: 'u1', platform: 'na1' })).toString('base64url');
            axios.post.mockResolvedValue({ data: { access_token: 'tok' } });
            axios.get.mockRejectedValue(new Error('network error'));
            const req = { query: { code: 'abc', state: validState } };
            const res = buildRes();
            await handleRiotOAuthCallback(req, res);
            expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining('riot_error=account_fetch_failed'));
        });

        test('redirects with riot_error=already_linked when another user has the puuid', async () => {
            const validState = Buffer.from(JSON.stringify({ userId: 'u1', platform: 'na1' })).toString('base64url');
            axios.post.mockResolvedValue({ data: { access_token: 'tok' } });
            axios.get.mockResolvedValue({ data: { puuid: 'p1', gameName: 'V', tagLine: 'EUW' } });
            User.findOne.mockResolvedValue({ _id: 'other-user' });
            const req = { query: { code: 'abc', state: validState } };
            const res = buildRes();
            await handleRiotOAuthCallback(req, res);
            expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining('riot_error=already_linked'));
        });

        test('redirects with riot_linked=1 on full success', async () => {
            const validState = Buffer.from(JSON.stringify({ userId: 'u1', platform: 'na1' })).toString('base64url');
            axios.post.mockResolvedValue({ data: { access_token: 'tok' } });
            axios.get.mockResolvedValue({ data: { puuid: 'p1', gameName: 'V', tagLine: 'EUW' } });
            User.findOne.mockResolvedValue(null);
            User.findByIdAndUpdate.mockResolvedValue({});
            riotService.getFullLolProfile.mockResolvedValue({});
            const req = { query: { code: 'abc', state: validState } };
            const res = buildRes();
            await handleRiotOAuthCallback(req, res);
            expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining('riot_linked=1'));
        });
    });

    describe('submitLolMatch', () => {
        test('returns 400 for LOBBY_NOT_PENDING', async () => {
            const session = {
                withTransaction: jest.fn(async () => { throw new Error('LOBBY_NOT_PENDING'); }),
                endSession: jest.fn().mockResolvedValue(undefined)
            };
            mongoose.startSession.mockResolvedValue(session);
            const req = { userId: 'u1', body: { lobbyId: 'l1', matchId: 'm1' } };
            const res = buildRes();
            await submitLolMatch(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        test('returns 400 for RIOT_ACCOUNT_NOT_LINKED', async () => {
            const session = {
                withTransaction: jest.fn(async () => { throw new Error('RIOT_ACCOUNT_NOT_LINKED'); }),
                endSession: jest.fn().mockResolvedValue(undefined)
            };
            mongoose.startSession.mockResolvedValue(session);
            const req = { userId: 'u1', body: { lobbyId: 'l1', matchId: 'm1' } };
            const res = buildRes();
            await submitLolMatch(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        test('returns 500 for unknown errors', async () => {
            const session = {
                withTransaction: jest.fn(async () => { throw new Error('SOME_UNKNOWN_ERROR'); }),
                endSession: jest.fn().mockResolvedValue(undefined)
            };
            mongoose.startSession.mockResolvedValue(session);
            const req = { userId: 'u1', body: { lobbyId: 'l1', matchId: 'm1' } };
            const res = buildRes();
            await submitLolMatch(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });
});
