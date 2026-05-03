const service = require('../services/apiriotprofileService.js');

module.exports.funcapiriotprofile = function funcapiriotprofile(req, res) {
    service.funcapiriotprofile(req, res);
}
module.exports.func = module.exports.funcapiriotprofile;
