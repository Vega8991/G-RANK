let jwt = require('jsonwebtoken');

function verifyToken(req, res, next){
    let authHeader = req.headers['authorization'];

    if(!authHeader) {
        res.status(403).json({
            success: false,
            message: 'No token provided'
        });
        return;
    }

    let token = authHeader.replace('Bearer ', '');
    let secretKey = process.env.JWT_SECRET;

    jwt.verify(token, secretKey, (err, decoded) => {
        if(err){
            res.status(401).json({
                success: false,
                message: 'Invalid or expired token'
            });
            return;
        }

        req.userId = decoded.userId;
        req.userEmail = decoded.email;
        req.username = decoded.username;

        next();
    });
}

module.exports = { verifyToken };
