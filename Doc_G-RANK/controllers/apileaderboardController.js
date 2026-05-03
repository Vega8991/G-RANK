const service = require('../services/apileaderboardService.js');

module.exports.funcapileaderboard = function funcapileaderboard(req, res) {
    service.funcapileaderboard(req, res);
}
module.exports.func = module.exports.funcapileaderboard;
