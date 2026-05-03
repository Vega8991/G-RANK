const service = require('../services/apiriotunlinkService.js');

module.exports.funcapiriotunlink = function funcapiriotunlink(req, res) {
    service.funcapiriotunlink(req, res);
}
module.exports.func = module.exports.funcapiriotunlink;
