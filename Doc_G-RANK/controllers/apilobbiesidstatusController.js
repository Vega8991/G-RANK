const service = require('../services/apilobbiesidstatusService.js');

module.exports.funcapilobbiesidstatus = function funcapilobbiesidstatus(req, res) {
    service.funcapilobbiesidstatus(req, res);
}
module.exports.func = module.exports.funcapilobbiesidstatus;

