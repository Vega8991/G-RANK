let jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
    let token = req.cookies?.token;

    if (!token) {
        const authHeader = req.headers['authorization'];
        if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
            token = authHeader.slice(7);
        }
    }

    if (!token) {
        res.status(403).json({ success: false, message: 'No token provided' });
        return;
    }

    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) {
        res.status(500).json({ success: false, message: 'Server configuration error' });
        return;
    }

    jwt.verify(token, secretKey, { algorithms: ['HS256'] }, (err, decoded) => {
        if (err) {
            res.status(401).json({ success: false, message: 'Invalid or expired token' });
            return;
        }

        req.userId    = decoded.userId;
        req.userEmail = decoded.email;
        req.username  = decoded.username;
        req.userRole  = decoded.role || 'USER';

        next();
    });
}

module.exports = { verifyToken };
