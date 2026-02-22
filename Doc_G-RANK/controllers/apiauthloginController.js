const service = require('../services/apiauthloginService.js');

module.exports.funcapiauthlogin = function funcapiauthlogin(req, res) {
    service.funcapiauthlogin(req, res);
}
module.exports.func = module.exports.funcapiauthlogin;

