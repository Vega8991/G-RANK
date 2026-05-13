const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const User = require('../../models/userModel');

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
    await User.deleteMany({});
});

function validUserData(overrides = {}) {
    return {
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedpassword',
        ...overrides
    };
}

describe('User model', () => {
    test('saves valid user with required fields', async () => {
        const user = await User.create(validUserData());
        expect(user._id).toBeDefined();
        expect(user.username).toBe('testuser');
        expect(user.email).toBe('test@example.com');
    });

    test('applies default values on creation', async () => {
        const user = await User.create(validUserData());
        expect(user.rank).toBe('Bronze');
        expect(user.mmr).toBe(250);
        expect(user.winRate).toBe(0);
        expect(user.winStreak).toBe(0);
        expect(user.totalMatches).toBe(0);
        expect(user.wins).toBe(0);
        expect(user.losses).toBe(0);
        expect(user.status).toBe('active');
        expect(user.role).toBe('USER');
        expect(user.isEmailVerified).toBe(false);
        expect(user.country).toBe('');
    });

    test('rejects missing username', async () => {
        await expect(User.create({ email: 'x@x.com', password: 'pass' }))
            .rejects.toThrow();
    });

    test('rejects missing email', async () => {
        await expect(User.create({ username: 'x', password: 'pass' }))
            .rejects.toThrow();
    });

    test('rejects missing password', async () => {
        await expect(User.create({ username: 'x', email: 'x@x.com' }))
            .rejects.toThrow();
    });

    test('enforces unique username', async () => {
        await User.create(validUserData());
        await expect(User.create(validUserData({ email: 'other@example.com' })))
            .rejects.toThrow();
    });

    test('enforces unique email', async () => {
        await User.create(validUserData());
        await expect(User.create(validUserData({ username: 'otheruser' })))
            .rejects.toThrow();
    });

    test('rejects invalid status enum', async () => {
        await expect(User.create(validUserData({ status: 'invalid_status' })))
            .rejects.toThrow();
    });

    test('accepts valid status values', async () => {
        for (const status of ['active', 'suspended', 'banned']) {
            const user = await User.create(validUserData({ username: status, email: `${status}@x.com`, status }));
            expect(user.status).toBe(status);
        }
    });

    test('rejects invalid role enum', async () => {
        await expect(User.create(validUserData({ role: 'SUPERUSER' })))
            .rejects.toThrow();
    });

    test('accepts valid role values', async () => {
        const user = await User.create(validUserData({ role: 'ADMIN' }));
        expect(user.role).toBe('ADMIN');
    });

    test('stores Riot account fields', async () => {
        const user = await User.create(validUserData({
            riotGameName: 'TestPlayer',
            riotTagLine: 'EUW',
            riotPuuid: 'puuid-123',
            riotPlatform: 'euw1'
        }));
        expect(user.riotGameName).toBe('TestPlayer');
        expect(user.riotTagLine).toBe('EUW');
        expect(user.riotPuuid).toBe('puuid-123');
        expect(user.riotPlatform).toBe('euw1');
    });

    test('riotCachedProfile defaults to null fields', async () => {
        const user = await User.create(validUserData());
        expect(user.riotCachedProfile.tier).toBeNull();
        expect(user.riotCachedProfile.rank).toBeNull();
        expect(user.riotCachedProfile.hotStreak).toBe(false);
    });

    test('stores passwordResetToken and expiry', async () => {
        const expires = new Date(Date.now() + 3600000);
        const user = await User.create(validUserData({
            passwordResetToken: 'reset-tok',
            passwordResetExpires: expires
        }));
        expect(user.passwordResetToken).toBe('reset-tok');
        expect(user.passwordResetExpires).toEqual(expires);
    });

    test('joinDate defaults to current time', async () => {
        const before = new Date();
        const user = await User.create(validUserData());
        const after = new Date();
        expect(user.joinDate.getTime()).toBeGreaterThanOrEqual(before.getTime());
        expect(user.joinDate.getTime()).toBeLessThanOrEqual(after.getTime());
    });
});
