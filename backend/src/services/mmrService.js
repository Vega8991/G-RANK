const User = require('../models/userModel');

const RANKS = {
    'Bronze': { min: 0, max: 499 },
    'Silver': { min: 500, max: 999 },
    'Gold': { min: 1000, max: 1499 },
    'Platinum': { min: 1500, max: 1999 },
    'Diamond': { min: 2000, max: 2499 },
    'Master': { min: 2500, max: 2999 },
    'Elite': { min: 3000, max: Infinity }
}

const MMR_CHANGES = {
    'Bronze': { win: 50, loss: 25 },
    'Silver': { win: 40, loss: 20 },
    'Gold': { win: 32, loss: 18 },
    'Platinum': { win: 30, loss: 20 },
    'Diamond': { win: 25, loss: 25 },
    'Master': { win: 20, loss: 25 },
    'Elite': { win: 15, loss: 30 }
}

function getRankFromMMR(mmr) {
    for (let rank in RANKS) {
        if (mmr >= RANKS[rank].min && mmr <= RANKS[rank].max) {
            return rank;
        }
    }
    return 'Bronce';
}

function calculateMMRChange(currentMMR, isWinner) {
    const currentRank = getRankFromMMR(currentMMR);
    const changes = MMR_CHANGES[currentRank];

    if (isWinner) {
        return changes.win;
    } else {
        return -changes.loss;
    }
}

async function updateUserStats(userId, isWinner, mmrChange) {
    try {
        const user = await User.findById(userId);

        if (!user) {
            throw new Error('User not found');
        }

        user.mmr = Math.max(0, user.mmr + mmrChange);
        user.rank = getRankFromMMR(user.mmr);

        if (isWinner) {
            user.wins = user.wins + 1;
        } else {
            user.losses = user.losses + 1;
        }

        const totalMatches = user.wins + user.losses;
        
        if (totalMatches > 0) {
            user.winRate = ((user.wins / totalMatches) * 100).toFixed(2);
        } else {
            user.winRate = 0;
        }

        if (isWinner) {
            user.winStreak = user.winStreak + 1;
        } else {
            user.winStreak = 0;
        }

        await user.save();

        return {
            success: true,
            user: user,
            mmrChange: mmrChange,
            newRank: user.rank
        };

    } catch (error) {
        throw error;
    }
}

module.exports = {
    getRankFromMMR,
    calculateMMRChange,
    updateUserStats,
    RANKS,
    MMR_CHANGES
};