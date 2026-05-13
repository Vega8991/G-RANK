const { requireAdmin } = require('../../middlewares/adminMiddleware');

function buildRes() {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}

describe('adminMiddleware.requireAdmin', () => {
    test('returns 403 when userRole is USER', () => {
        const req = { userRole: 'USER' };
        const res = buildRes();
        const next = jest.fn();

        requireAdmin(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
    });

    test('returns 403 when userRole is undefined', () => {
        const req = {};
        const res = buildRes();
        const next = jest.fn();

        requireAdmin(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
    });

    test('calls next when userRole is ADMIN', () => {
        const req = { userRole: 'ADMIN' };
        const res = buildRes();
        const next = jest.fn();

        requireAdmin(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
    });
});
