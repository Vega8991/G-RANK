const service = require('../services/apiauthverifyemailService.js');

module.exports.funcapiauthverifyemail = function funcapiauthverifyemail(req, res) {
    service.funcapiauthverifyemail(req, res);
}
module.exports.func = module.exports.funcapiauthverifyemail;

