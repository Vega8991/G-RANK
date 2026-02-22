const service = require('../services/apilobbiesidService.js');

module.exports.funcapilobbiesid = function funcapilobbiesid(req, res) {
    service.funcapilobbiesid(req, res);
}
module.exports.func = module.exports.funcapilobbiesid;

