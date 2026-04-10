const axios = require('axios');

const RIOT_API_KEY = process.env.RIOT_API_KEY;

// LoL platform → regional cluster (for match history & account lookups)
const PLATFORM_TO_CLUSTER = {
    'na1':  'americas',
    'na2':  'americas',
    'br1':  'americas',
    'la1':  'americas',
    'la2':  'americas',
    'euw1': 'europe',
    'eun1': 'europe',
    'tr1':  'europe',
    'ru':   'europe',
    'kr':   'asia',
    'jp1':  'asia',
    'oc1':  'sea',
    'ph2':  'sea',
    'sg2':  'sea',
    'th2':  'sea',
    'tw2':  'sea',
    'vn2':  'sea'
};

// LoL platform → Valorant platform
const PLATFORM_TO_VAL_PLATFORM = {
    'na1':  'na',
    'na2':  'na',
    'br1':  'br',
    'la1':  'latam',
    'la2':  'latam',
    'euw1': 'eu',
    'eun1': 'eu',
    'tr1':  'eu',
    'ru':   'eu',
    'kr':   'kr',
    'jp1':  'ap',
    'oc1':  'ap',
    'ph2':  'ap',
    'sg2':  'ap',
    'th2':  'ap',
    'tw2':  'ap',
    'vn2':  'ap'
};

// Derive cluster from a LoL match ID prefix (e.g. "NA1_1234" → "americas")
function getClusterFromMatchId(matchId) {
    const prefix = matchId.split('_')[0].toLowerCase();
    return PLATFORM_TO_CLUSTER[prefix] || 'americas';
}

function getClusterFromPlatform(platform) {
    return PLATFORM_TO_CLUSTER[platform.toLowerCase()] || 'americas';
}

function getValPlatformFromLolPlatform(lolPlatform) {
    return PLATFORM_TO_VAL_PLATFORM[lolPlatform.toLowerCase()] || 'na';
}

function riotRequest(url) {
    return axios.get(url, {
        headers: { 'X-Riot-Token': RIOT_API_KEY },
        timeout: 10000
    });
}

// --- Account-V1 (cross-game) ---

async function getAccountByRiotId(gameName, tagLine, cluster = 'americas') {
    const url = `https://${cluster}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
    const res = await riotRequest(url);
    return res.data; // { puuid, gameName, tagLine }
}

async function getAccountByPuuid(puuid, cluster = 'americas') {
    const url = `https://${cluster}.api.riotgames.com/riot/account/v1/accounts/by-puuid/${encodeURIComponent(puuid)}`;
    const res = await riotRequest(url);
    return res.data; // { puuid, gameName, tagLine }
}

// --- Summoner-V4 (LoL only) ---

async function getSummonerByPuuid(puuid, platform = 'na1') {
    const url = `https://${platform}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${encodeURIComponent(puuid)}`;
    const res = await riotRequest(url);
    return res.data; // { id, accountId, puuid, name, profileIconId, revisionDate, summonerLevel }
}

// --- League-V4 (LoL ranked stats) ---

async function getRankedStatsBySummonerId(summonerId, platform = 'na1') {
    const url = `https://${platform}.api.riotgames.com/lol/league/v4/entries/by-summoner/${encodeURIComponent(summonerId)}`;
    const res = await riotRequest(url);
    return res.data; // Array of LeagueEntryDTO
}

// --- Champion-Mastery-V4 ---

async function getTopChampionMasteries(puuid, platform = 'na1', count = 5) {
    const url = `https://${platform}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${encodeURIComponent(puuid)}/top?count=${count}`;
    const res = await riotRequest(url);
    return res.data;
}

// --- Match-V5 (LoL match history & details) ---

async function getLolMatchIds(puuid, cluster = 'americas', count = 20) {
    const url = `https://${cluster}.api.riotgames.com/lol/match/v5/matches/by-puuid/${encodeURIComponent(puuid)}/ids?count=${count}`;
    const res = await riotRequest(url);
    return res.data; // Array of matchId strings
}

async function getLolMatchById(matchId) {
    const cluster = getClusterFromMatchId(matchId);
    const url = `https://${cluster}.api.riotgames.com/lol/match/v5/matches/${encodeURIComponent(matchId)}`;
    const res = await riotRequest(url);
    return res.data;
}

// --- VAL-MATCH-V1 (Valorant match details) ---

async function getValorantMatchById(matchId, valPlatform = 'na') {
    const url = `https://${valPlatform}.api.riotgames.com/val/match/v1/matches/${encodeURIComponent(matchId)}`;
    const res = await riotRequest(url);
    return res.data;
}

async function getValorantMatchHistory(puuid, valPlatform = 'na') {
    const url = `https://${valPlatform}.api.riotgames.com/val/match/v1/matchlists/by-puuid/${encodeURIComponent(puuid)}`;
    const res = await riotRequest(url);
    return res.data;
}

// --- Composite helpers ---

// Full LoL ranked profile for a user given their platform
async function getFullLolProfile(puuid, platform) {
    const cluster = getClusterFromPlatform(platform);

    const [accountData, summonerData] = await Promise.all([
        getAccountByPuuid(puuid, cluster),
        getSummonerByPuuid(puuid, platform)
    ]);

    const [rankedStats, topChampions] = await Promise.all([
        getRankedStatsBySummonerId(summonerData.id, platform),
        getTopChampionMasteries(puuid, platform, 5)
    ]);

    const soloQueue = rankedStats.find(e => e.queueType === 'RANKED_SOLO_5x5') || null;
    const flexQueue  = rankedStats.find(e => e.queueType === 'RANKED_FLEX_SR') || null;

    return {
        account:      accountData,
        summoner:     summonerData,
        rankedSolo:   soloQueue,
        rankedFlex:   flexQueue,
        topChampions: topChampions
    };
}

module.exports = {
    getAccountByRiotId,
    getAccountByPuuid,
    getSummonerByPuuid,
    getRankedStatsBySummonerId,
    getTopChampionMasteries,
    getLolMatchIds,
    getLolMatchById,
    getValorantMatchById,
    getValorantMatchHistory,
    getFullLolProfile,
    getClusterFromPlatform,
    getValPlatformFromLolPlatform
};
