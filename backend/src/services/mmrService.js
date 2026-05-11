const User = require('../models/userModel');

// Each rank has a minimum and maximum MMR value
const RANKS = {
    'Bronze':   { min: 0,    max: 499  },
    'Silver':   { min: 500,  max: 999  },
    'Gold':     { min: 1000, max: 1499 },
    'Platinum': { min: 1500, max: 1999 },
    'Diamond':  { min: 2000, max: 2499 },
    'Master':   { min: 2500, max: 2999 },
    'Elite':    { min: 3000, max: Infinity }
};

// How many MMR points a player gains or loses per match, based on their current rank
const MMR_CHANGES = {
    'Bronze':   { win: 50, loss: 25 },
    'Silver':   { win: 40, loss: 20 },
    'Gold':     { win: 32, loss: 18 },
    'Platinum': { win: 30, loss: 20 },
    'Diamond':  { win: 25, loss: 25 },
    'Master':   { win: 20, loss: 25 },
    'Elite':    { win: 15, loss: 30 }
};

// Given a player's MMR number, return the rank name they belong to
function getRankFromMMR(mmr) {
    const rankNames = Object.keys(RANKS);

    for (let i = 0; i < rankNames.length; i++) {
        const rankName = rankNames[i];
        const rankRange = RANKS[rankName];

        if (mmr >= rankRange.min && mmr <= rankRange.max) {
            return rankName;
        }
    }

    return 'Bronze'; // default fallback
}

// Returns how many MMR points the player gains (positive) or loses (negative)
function calculateMMRChange(currentMMR, isWinner) {
    const currentRank = getRankFromMMR(currentMMR);
    const changes = MMR_CHANGES[currentRank];

    if (isWinner) {
        return changes.win;
    } else {
        return -changes.loss; // negative number because they lost
    }
}

// Update a player's stats in the database after a match.
// session is a MongoDB transaction session (optional, used when called inside a transaction).
async function updateUserStats(userId, isWinner, mmrChange, session) {
    const query = User.findById(userId);

    // If we're inside a transaction, attach the session so the change is atomic
    if (session) {
        query.session(session);
    }

    const user = await query;

    if (!user) {
        throw new Error('User not found');
    }

    // Update MMR — never go below 0
    user.mmr = Math.max(0, user.mmr + mmrChange);
    user.rank = getRankFromMMR(user.mmr);

    // Update win/loss count
    if (isWinner) {
        user.wins = user.wins + 1;
    } else {
        user.losses = user.losses + 1;
    }

    // Recalculate win rate as a percentage
    const totalMatches = user.wins + user.losses;
    if (totalMatches > 0) {
        user.winRate = ((user.wins / totalMatches) * 100).toFixed(2);
    } else {
        user.winRate = 0;
    }

    // Update win streak — resets to 0 on a loss
    if (isWinner) {
        user.winStreak = user.winStreak + 1;
    } else {
        user.winStreak = 0;
    }

    if (session) {
        await user.save({ session: session });
    } else {
        await user.save();
    }

    return {
        success: true,
        user: user,
        mmrChange: mmrChange,
        newRank: user.rank
    };
}

module.exports = {
    getRankFromMMR,
    calculateMMRChange,
    updateUserStats,
    RANKS,
    MMR_CHANGES
};
