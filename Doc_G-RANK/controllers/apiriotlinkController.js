const service = require('../services/apiriotlinkService.js');

module.exports.funcapiriotlink = function funcapiriotlink(req, res) {
    service.funcapiriotlink(req, res);
}
module.exports.func = module.exports.funcapiriotlink;
