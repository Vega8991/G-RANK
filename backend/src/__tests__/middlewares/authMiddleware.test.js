const jwt = require('jsonwebtoken');
const { verifyToken } = require('../../middlewares/authMiddleware');

jest.mock('jsonwebtoken', () => ({
    verify: jest.fn()
}));

function buildRes() {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}

describe('authMiddleware.verifyToken', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.JWT_SECRET = 'secret-key';
    });

    test('returns 403 when no token in cookies', () => {
        const req = { cookies: {} };
        const res = buildRes();
        const next = jest.fn();

        verifyToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
    });

    test('returns 500 when JWT secret is missing', () => {
        delete process.env.JWT_SECRET;
        const req = { cookies: { token: 'abc' } };
        const res = buildRes();
        const next = jest.fn();

        verifyToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(next).not.toHaveBeenCalled();
    });

    test('returns 401 when token is invalid', () => {
        jwt.verify.mockImplementation((token, secret, options, cb) => cb(new Error('bad token')));

        const req = { cookies: { token: 'bad-token' } };
        const res = buildRes();
        const next = jest.fn();

        verifyToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    test('sets user fields and calls next when token is valid', () => {
        jwt.verify.mockImplementation((token, secret, options, cb) => cb(null, {
            userId: 'u1',
            email: 'user@test.com',
            username: 'user1',
            role: 'ADMIN'
        }));

        const req = { cookies: { token: 'good-token' } };
        const res = buildRes();
        const next = jest.fn();

        verifyToken(req, res, next);

        expect(req.userId).toBe('u1');
        expect(req.userEmail).toBe('user@test.com');
        expect(req.username).toBe('user1');
        expect(req.userRole).toBe('ADMIN');
        expect(next).toHaveBeenCalledTimes(1);
    });
});
