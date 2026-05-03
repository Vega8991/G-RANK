const service = require('../services/apiadminlobbiesidService.js');

module.exports.funcapiadminlobbiesid = function funcapiadminlobbiesid(req, res) {
    service.funcapiadminlobbiesid(req, res);
}
module.exports.func = module.exports.funcapiadminlobbiesid;
