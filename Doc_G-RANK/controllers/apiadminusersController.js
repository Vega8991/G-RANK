const service = require('../services/apiadminusersService.js');

module.exports.funcapiadminusers = function funcapiadminusers(req, res) {
    service.funcapiadminusers(req, res);
}
module.exports.func = module.exports.funcapiadminusers;
