function requireAdmin(req, res, next) {
    if (req.userRole !== 'ADMIN') {
        return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    next();
}

module.exports = { requireAdmin };
