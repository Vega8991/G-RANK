const User = require('../models/userModel');

async function getLeaderboard(req, res) {
    try {
        const limit = Math.min(parseInt(req.query.limit) || 50, 100);

        const players = await User.find({ totalMatches: { $gt: 0 } })
            .select('username mmr rank wins losses winRate winStreak country totalMatches')
            .sort({ mmr: -1 })
            .limit(limit)
            .lean();

        res.status(200).json({ success: true, players });
    } catch (err) {
        console.error('[getLeaderboard]', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

module.exports = { getLeaderboard };
