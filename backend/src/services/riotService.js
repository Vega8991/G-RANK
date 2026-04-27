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

// Derive cluster from a LoL match ID prefix (e.g. "NA1_1234" → "americas")
function getClusterFromMatchId(matchId) {
    const prefix = matchId.split('_')[0].toLowerCase();
    return PLATFORM_TO_CLUSTER[prefix] || 'americas';
}

function getClusterFromPlatform(platform) {
    return PLATFORM_TO_CLUSTER[platform.toLowerCase()] || 'americas';
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

// --- Composite helpers ---

// Full LoL ranked profile for a user given their platform.
// Resilient: partial failures return null for that section instead of throwing.
async function getFullLolProfile(puuid, platform) {
    const cluster = getClusterFromPlatform(platform);

    const [accountData, summonerData] = await Promise.all([
        getAccountByPuuid(puuid, cluster).catch(() => null),
        getSummonerByPuuid(puuid, platform).catch(() => null)
    ]);

    let rankedStats   = [];
    let topChampions  = [];

    if (summonerData?.id) {
        [rankedStats, topChampions] = await Promise.all([
            getRankedStatsBySummonerId(summonerData.id, platform).catch(() => []),
            getTopChampionMasteries(puuid, platform, 5).catch(() => [])
        ]);
    } else {
        topChampions = await getTopChampionMasteries(puuid, platform, 5).catch(() => []);
    }

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
    getFullLolProfile,
    getClusterFromPlatform
};
