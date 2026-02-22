const service = require('../services/apilobbyparticipantsregisterService.js');

module.exports.funcapilobbyparticipantsregister = function funcapilobbyparticipantsregister(req, res) {
    service.funcapilobbyparticipantsregister(req, res);
}
module.exports.func = module.exports.funcapilobbyparticipantsregister;

