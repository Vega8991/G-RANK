const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const LobbyParticipant = require('../../models/lobbyParticipantModel');

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    await LobbyParticipant.createIndexes();
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

afterEach(async () => {
    await LobbyParticipant.deleteMany({});
});

const lobbyId = new mongoose.Types.ObjectId();
const userId = new mongoose.Types.ObjectId();

function validParticipantData(overrides = {}) {
    return {
        lobbyId,
        userId,
        mmrBefore: 250,
        ...overrides
    };
}

describe('LobbyParticipant model', () => {
    test('saves valid participant', async () => {
        const p = await LobbyParticipant.create(validParticipantData());
        expect(p._id).toBeDefined();
        expect(p.mmrBefore).toBe(250);
    });

    test('applies default values', async () => {
        const p = await LobbyParticipant.create(validParticipantData());
        expect(p.status).toBe('registered');
        expect(p.hasSubmittedResults).toBe(false);
        expect(p.finalPosition).toBeNull();
        expect(p.mmrAfter).toBeNull();
        expect(p.mmrChange).toBe(0);
    });

    test('rejects missing lobbyId', async () => {
        await expect(LobbyParticipant.create(validParticipantData({ lobbyId: undefined })))
            .rejects.toThrow();
    });

    test('rejects missing userId', async () => {
        await expect(LobbyParticipant.create(validParticipantData({ userId: undefined })))
            .rejects.toThrow();
    });

    test('rejects missing mmrBefore', async () => {
        await expect(LobbyParticipant.create(validParticipantData({ mmrBefore: undefined })))
            .rejects.toThrow();
    });

    test('rejects invalid status enum', async () => {
        await expect(LobbyParticipant.create(validParticipantData({ status: 'unknown' })))
            .rejects.toThrow();
    });

    test('accepts all valid status values', async () => {
        for (const [i, status] of ['registered', 'played', 'verified', 'disqualified'].entries()) {
            const p = await LobbyParticipant.create(
                validParticipantData({ userId: new mongoose.Types.ObjectId(), status })
            );
            expect(p.status).toBe(status);
        }
    });

    test('enforces compound unique index on (lobbyId, userId)', async () => {
        await LobbyParticipant.create(validParticipantData());
        await expect(LobbyParticipant.create(validParticipantData()))
            .rejects.toThrow();
    });

    test('allows same userId in different lobbies', async () => {
        await LobbyParticipant.create(validParticipantData());
        const p2 = await LobbyParticipant.create(
            validParticipantData({ lobbyId: new mongoose.Types.ObjectId() })
        );
        expect(p2._id).toBeDefined();
    });

    test('allows same lobbyId with different users', async () => {
        await LobbyParticipant.create(validParticipantData());
        const p2 = await LobbyParticipant.create(
            validParticipantData({ userId: new mongoose.Types.ObjectId() })
        );
        expect(p2._id).toBeDefined();
    });

    test('registrationDate defaults to now', async () => {
        const before = new Date();
        const p = await LobbyParticipant.create(validParticipantData());
        const after = new Date();
        expect(p.registrationDate.getTime()).toBeGreaterThanOrEqual(before.getTime());
        expect(p.registrationDate.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    test('stores mmrAfter and mmrChange when provided', async () => {
        const p = await LobbyParticipant.create(validParticipantData({ mmrAfter: 275, mmrChange: 25 }));
        expect(p.mmrAfter).toBe(275);
        expect(p.mmrChange).toBe(25);
    });
});
