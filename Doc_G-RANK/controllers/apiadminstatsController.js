const service = require('../services/apiadminstatsService.js');

module.exports.funcapiadminstats = function funcapiadminstats(req, res) {
    service.funcapiadminstats(req, res);
}
module.exports.func = module.exports.funcapiadminstats;
