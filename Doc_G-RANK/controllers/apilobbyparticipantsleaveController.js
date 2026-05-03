const service = require('../services/apilobbyparticipantsleaveService.js');

module.exports.funcapilobbyparticipantsleave = function funcapilobbyparticipantsleave(req, res) {
    service.funcapilobbyparticipantsleave(req, res);
}
module.exports.func = module.exports.funcapilobbyparticipantsleave;
