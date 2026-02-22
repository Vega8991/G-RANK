const service = require('../services/apiauthregisterService.js');

module.exports.funcapiauthregister = function funcapiauthregister(req, res) {
    service.funcapiauthregister(req, res);
}
module.exports.func = module.exports.funcapiauthregister;

