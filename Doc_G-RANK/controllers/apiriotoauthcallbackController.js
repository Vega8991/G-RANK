const service = require('../services/apiriotoauthcallbackService.js');

module.exports.funcapiriotoauthcallback = function funcapiriotoauthcallback(req, res) {
    service.funcapiriotoauthcallback(req, res);
}
module.exports.func = module.exports.funcapiriotoauthcallback;
