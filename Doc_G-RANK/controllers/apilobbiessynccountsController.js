const service = require('../services/apilobbiessynccountsService.js');

module.exports.funcapilobbiessynccounts = function funcapilobbiessynccounts(req, res) {
    service.funcapilobbiessynccounts(req, res);
}
module.exports.func = module.exports.funcapilobbiessynccounts;

