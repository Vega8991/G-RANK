const service = require('../services/apiauthresetpasswordService.js');

module.exports.funcapiauthresetpassword = function funcapiauthresetpassword(req, res) {
    service.funcapiauthresetpassword(req, res);
}
module.exports.func = module.exports.funcapiauthresetpassword;
