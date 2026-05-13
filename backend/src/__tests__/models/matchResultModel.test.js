const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const MatchResult = require('../../models/matchResultModel');

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

afterEach(async () => {
    await MatchResult.deleteMany({});
});

const lobbyId = new mongoose.Types.ObjectId();
const submittedBy = new mongoose.Types.ObjectId();

function validMatchData(overrides = {}) {
    return {
        lobbyId,
        submittedBy,
        ...overrides
    };
}

describe('MatchResult model', () => {
    test('saves valid match result', async () => {
        const m = await MatchResult.create(validMatchData());
        expect(m._id).toBeDefined();
        expect(m.lobbyId.toString()).toBe(lobbyId.toString());
    });

    test('applies default values', async () => {
        const m = await MatchResult.create(validMatchData());
        expect(m.game).toBe('pokemon_showdown');
        expect(m.replayUrl).toBeNull();
        expect(m.matchId).toBeNull();
        expect(m.winnerId).toBeNull();
        expect(m.loserId).toBeNull();
        expect(m.replayData).toBeNull();
        expect(m.verified).toBe(false);
    });

    test('rejects missing lobbyId', async () => {
        await expect(MatchResult.create(validMatchData({ lobbyId: undefined })))
            .rejects.toThrow();
    });

    test('rejects missing submittedBy', async () => {
        await expect(MatchResult.create(validMatchData({ submittedBy: undefined })))
            .rejects.toThrow();
    });

    test('rejects invalid game enum', async () => {
        await expect(MatchResult.create(validMatchData({ game: 'chess' })))
            .rejects.toThrow();
    });

    test('accepts all valid game values', async () => {
        for (const game of ['pokemon_showdown', 'league_of_legends', 'valorant']) {
            const m = await MatchResult.create(validMatchData({ game }));
            expect(m.game).toBe(game);
            await MatchResult.deleteMany({});
        }
    });

    test('accepts valid Pokemon Showdown replay URL', async () => {
        const replayUrl = 'https://replay.pokemonshowdown.com/gen9ou-12345';
        const m = await MatchResult.create(validMatchData({ replayUrl }));
        expect(m.replayUrl).toBe(replayUrl);
    });

    test('rejects invalid replay URL (wrong domain)', async () => {
        await expect(MatchResult.create(validMatchData({
            replayUrl: 'https://youtube.com/watch?v=abc'
        }))).rejects.toThrow('Must be a valid Pokemon Showdown replay URL');
    });

    test('rejects invalid replay URL (http instead of https)', async () => {
        await expect(MatchResult.create(validMatchData({
            replayUrl: 'http://replay.pokemonshowdown.com/gen9ou-12345'
        }))).rejects.toThrow('Must be a valid Pokemon Showdown replay URL');
    });

    test('allows null replayUrl', async () => {
        const m = await MatchResult.create(validMatchData({ replayUrl: null }));
        expect(m.replayUrl).toBeNull();
    });

    test('stores winnerId and loserId', async () => {
        const winnerId = new mongoose.Types.ObjectId();
        const loserId = new mongoose.Types.ObjectId();
        const m = await MatchResult.create(validMatchData({ winnerId, loserId }));
        expect(m.winnerId.toString()).toBe(winnerId.toString());
        expect(m.loserId.toString()).toBe(loserId.toString());
    });

    test('submittedAt defaults to now', async () => {
        const before = new Date();
        const m = await MatchResult.create(validMatchData());
        const after = new Date();
        expect(m.submittedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
        expect(m.submittedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    test('stores replayData as mixed type', async () => {
        const replayData = { players: ['p1', 'p2'], turns: 42 };
        const m = await MatchResult.create(validMatchData({ replayData }));
        expect(m.replayData.players).toEqual(['p1', 'p2']);
        expect(m.replayData.turns).toBe(42);
    });

    test('can be marked as verified', async () => {
        const m = await MatchResult.create(validMatchData({ verified: true }));
        expect(m.verified).toBe(true);
    });
});
