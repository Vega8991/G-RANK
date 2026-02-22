const service = require('../services/apilobbiesmycreatedService.js');

module.exports.funcapilobbiesmycreated = function funcapilobbiesmycreated(req, res) {
    service.funcapilobbiesmycreated(req, res);
}
module.exports.func = module.exports.funcapilobbiesmycreated;

