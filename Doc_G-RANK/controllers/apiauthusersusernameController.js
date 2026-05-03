const service = require('../services/apiauthusersusernameService.js');

module.exports.funcapiauthusersusername = function funcapiauthusersusername(req, res) {
    service.funcapiauthusersusername(req, res);
}
module.exports.func = module.exports.funcapiauthusersusername;
