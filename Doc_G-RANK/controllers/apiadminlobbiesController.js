const service = require('../services/apiadminlobbiesService.js');

module.exports.funcapiadminlobbies = function funcapiadminlobbies(req, res) {
    service.funcapiadminlobbies(req, res);
}
module.exports.func = module.exports.funcapiadminlobbies;
