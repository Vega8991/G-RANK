const service = require('../services/apilobbyparticipantsmylobbiesService.js');

module.exports.funcapilobbyparticipantsmylobbies = function funcapilobbyparticipantsmylobbies(req, res) {
    service.funcapilobbyparticipantsmylobbies(req, res);
}
module.exports.func = module.exports.funcapilobbyparticipantsmylobbies;

