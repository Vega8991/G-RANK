const service = require('../services/apiauthforgotpasswordService.js');

module.exports.funcapiauthforgotpassword = function funcapiauthforgotpassword(req, res) {
    service.funcapiauthforgotpassword(req, res);
}
module.exports.func = module.exports.funcapiauthforgotpassword;
