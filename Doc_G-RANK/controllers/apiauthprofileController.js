const service = require('../services/apiauthprofileService.js');

module.exports.funcapiauthprofile = function funcapiauthprofile(req, res) {
    service.funcapiauthprofile(req, res);
}
module.exports.func = module.exports.funcapiauthprofile;

