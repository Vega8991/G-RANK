const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// bcrypt silently truncates input at 72 bytes — pre-hash with SHA-256 to handle long passwords
function normalizePassword(plainText) {
    return crypto.createHash('sha256').update(plainText, 'utf8').digest('hex');
}

function hashPassword(plainText) {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(normalizePassword(plainText), salt);
}

function comparePassword(plainText, hash) {
    if (!hash || !hash.startsWith('$2')) return false;
    return bcrypt.compareSync(normalizePassword(plainText), hash);
}

module.exports = { hashPassword, comparePassword };
