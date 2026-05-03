const service = require('../services/apiauthresendverificationService.js');

module.exports.funcapiauthresendverification = function funcapiauthresendverification(req, res) {
    service.funcapiauthresendverification(req, res);
}
module.exports.func = module.exports.funcapiauthresendverification;
