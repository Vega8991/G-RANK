const bcrypt = require('bcryptjs');

function hashPassword(plainText) {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(plainText, salt);
}

function comparePassword(plainText, hash) {
    return bcrypt.compareSync(plainText, hash);
}

module.exports = { hashPassword, comparePassword };
