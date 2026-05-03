const service = require('../services/apiriotsubmitlolmatchService.js');

module.exports.funcapiriotsubmitlolmatch = function funcapiriotsubmitlolmatch(req, res) {
    service.funcapiriotsubmitlolmatch(req, res);
}
module.exports.func = module.exports.funcapiriotsubmitlolmatch;
