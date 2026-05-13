const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const Lobby = require('../../models/lobbyModel');

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
    await Lobby.deleteMany({});
});

const createdBy = new mongoose.Types.ObjectId();

function validLobbyData(overrides = {}) {
    return {
        name: 'Test Lobby',
        game: 'pokemon_showdown',
        description: 'A test lobby',
        registrationDeadline: new Date(Date.now() + 86400000),
        matchDateTime: new Date(Date.now() + 172800000),
        maxParticipants: 8,
        createdBy,
        ...overrides
    };
}

describe('Lobby model', () => {
    test('saves valid lobby', async () => {
        const lobby = await Lobby.create(validLobbyData());
        expect(lobby._id).toBeDefined();
        expect(lobby.name).toBe('Test Lobby');
    });

    test('applies default values', async () => {
        const lobby = await Lobby.create(validLobbyData());
        expect(lobby.status).toBe('open');
        expect(lobby.currentParticipants).toBe(0);
        expect(lobby.prizePool).toBe('');
        expect(lobby.game).toBe('pokemon_showdown');
    });

    test('rejects missing name', async () => {
        await expect(Lobby.create(validLobbyData({ name: undefined })))
            .rejects.toThrow();
    });

    test('rejects missing description', async () => {
        await expect(Lobby.create(validLobbyData({ description: undefined })))
            .rejects.toThrow();
    });

    test('rejects missing registrationDeadline', async () => {
        await expect(Lobby.create(validLobbyData({ registrationDeadline: undefined })))
            .rejects.toThrow();
    });

    test('rejects missing matchDateTime', async () => {
        await expect(Lobby.create(validLobbyData({ matchDateTime: undefined })))
            .rejects.toThrow();
    });

    test('rejects missing maxParticipants', async () => {
        await expect(Lobby.create(validLobbyData({ maxParticipants: undefined })))
            .rejects.toThrow();
    });

    test('rejects missing createdBy', async () => {
        await expect(Lobby.create(validLobbyData({ createdBy: undefined })))
            .rejects.toThrow();
    });

    test('rejects invalid game enum', async () => {
        await expect(Lobby.create(validLobbyData({ game: 'fortnite' })))
            .rejects.toThrow();
    });

    test('accepts all valid game values', async () => {
        for (const [i, game] of ['pokemon_showdown', 'league_of_legends', 'valorant'].entries()) {
            const lobby = await Lobby.create(validLobbyData({ name: `Lobby ${i}`, game }));
            expect(lobby.game).toBe(game);
        }
    });

    test('rejects invalid status enum', async () => {
        await expect(Lobby.create(validLobbyData({ status: 'unknown' })))
            .rejects.toThrow();
    });

    test('accepts all valid status values', async () => {
        for (const [i, status] of ['open', 'pending', 'in_progress', 'completed', 'cancelled'].entries()) {
            const lobby = await Lobby.create(validLobbyData({ name: `Lobby ${i}`, status }));
            expect(lobby.status).toBe(status);
        }
    });

    test('createdAt defaults to now', async () => {
        const before = new Date();
        const lobby = await Lobby.create(validLobbyData());
        const after = new Date();
        expect(lobby.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
        expect(lobby.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    test('stores custom prizePool', async () => {
        const lobby = await Lobby.create(validLobbyData({ prizePool: '100 USD' }));
        expect(lobby.prizePool).toBe('100 USD');
    });
});
