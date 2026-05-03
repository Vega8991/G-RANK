const service = require('../services/apiadminusersidService.js');

module.exports.funcapiadminusersid = function funcapiadminusersid(req, res) {
    service.funcapiadminusersid(req, res);
}
module.exports.func = module.exports.funcapiadminusersid;
