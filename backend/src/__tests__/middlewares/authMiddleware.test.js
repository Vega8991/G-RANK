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

    test('returns 403 when no authorization header', () => {
        const req = { headers: {} };
        const res = buildRes();
        const next = jest.fn();

        verifyToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
    });

    test('returns 403 when token is empty', () => {
        const req = { headers: { authorization: 'Bearer ' } };
        const res = buildRes();
        const next = jest.fn();

        verifyToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Invalid token format' }));
        expect(next).not.toHaveBeenCalled();
    });

    test('returns 500 when JWT secret is missing', () => {
        delete process.env.JWT_SECRET;
        const req = { headers: { authorization: 'Bearer abc' } };
        const res = buildRes();
        const next = jest.fn();

        verifyToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(next).not.toHaveBeenCalled();
    });

    test('returns 401 when token is invalid', () => {
        jwt.verify.mockImplementation((token, secret, cb) => cb(new Error('bad token')));

        const req = { headers: { authorization: 'Bearer abc' } };
        const res = buildRes();
        const next = jest.fn();

        verifyToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    test('sets user fields and calls next when token is valid', () => {
        jwt.verify.mockImplementation((token, secret, cb) => cb(null, {
            userId: 'u1',
            email: 'user@test.com',
            username: 'user1',
            role: 'ADMIN'
        }));

        const req = { headers: { authorization: 'Bearer token-123' } };
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
