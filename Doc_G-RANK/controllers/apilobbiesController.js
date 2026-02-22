const service = require('../services/apilobbiesService.js');

module.exports.funcapilobbies = function funcapilobbies(req, res) {
    service.funcapilobbies(req, res);
}
module.exports.func = module.exports.funcapilobbies;

