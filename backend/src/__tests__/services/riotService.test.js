jest.mock('axios');

const axios = require('axios');
axios.get = jest.fn();

const {
    getClusterFromPlatform,
    buildCachedProfile,
    getAccountByRiotId,
    getFullLolProfile
} = require('../../services/riotService');

describe('riotService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.RIOT_API_KEY = 'test-key';
    });

    test('getClusterFromPlatform maps na1 to americas', () => {
        expect(getClusterFromPlatform('na1')).toBe('americas');
    });

    test('getClusterFromPlatform maps euw1 to europe', () => {
        expect(getClusterFromPlatform('euw1')).toBe('europe');
    });

    test('getClusterFromPlatform maps kr to asia', () => {
        expect(getClusterFromPlatform('kr')).toBe('asia');
    });

    test('getClusterFromPlatform maps oc1 to sea', () => {
        expect(getClusterFromPlatform('oc1')).toBe('sea');
    });

    test('getClusterFromPlatform unknown platform defaults to americas', () => {
        expect(getClusterFromPlatform('unknown')).toBe('americas');
    });

    test('buildCachedProfile maps solo queue stats correctly', () => {
        const profile = {
            rankedSolo: {
                tier: 'GOLD',
                rank: 'II',
                leaguePoints: 75,
                wins: 30,
                losses: 20,
                hotStreak: true
            },
            summoner: {
                summonerLevel: 100,
                profileIconId: 4567
            }
        };

        const result = buildCachedProfile(profile);

        expect(result.tier).toBe('GOLD');
        expect(result.rank).toBe('II');
        expect(result.leaguePoints).toBe(75);
        expect(result.rankedWins).toBe(30);
        expect(result.rankedLosses).toBe(20);
        expect(result.summonerLevel).toBe(100);
        expect(result.profileIconId).toBe(4567);
        expect(result.hotStreak).toBe(true);
    });

    test('buildCachedProfile returns nulls when rankedSolo is null', () => {
        const profile = {
            rankedSolo: null,
            summoner: { summonerLevel: 50, profileIconId: 1 }
        };

        const result = buildCachedProfile(profile);

        expect(result.tier).toBeNull();
        expect(result.rank).toBeNull();
        expect(result.leaguePoints).toBeNull();
        expect(result.rankedWins).toBeNull();
        expect(result.rankedLosses).toBeNull();
    });

    test('buildCachedProfile returns null summoner fields when summoner is null', () => {
        const profile = {
            rankedSolo: null,
            summoner: null
        };

        const result = buildCachedProfile(profile);

        expect(result.summonerLevel).toBeNull();
        expect(result.profileIconId).toBeNull();
    });

    test('getAccountByRiotId calls correct Riot API URL', async () => {
        axios.get.mockResolvedValue({ data: { puuid: 'p1' } });

        await getAccountByRiotId('TestName', 'EUW', 'europe');

        const calledUrl = axios.get.mock.calls[0][0];
        expect(calledUrl).toContain('/riot/account/v1/accounts/by-riot-id/');
    });

    test('getFullLolProfile returns full profile', async () => {
        axios.get
            .mockResolvedValueOnce({ data: { puuid: 'p1', gameName: 'Test', tagLine: 'EUW' } })
            .mockResolvedValueOnce({ data: { id: 'sum1', summonerLevel: 80, profileIconId: 100 } })
            .mockResolvedValueOnce({ data: [{ queueType: 'RANKED_SOLO_5x5', tier: 'SILVER', rank: 'I', leaguePoints: 50, wins: 10, losses: 5, hotStreak: false }] })
            .mockResolvedValueOnce({ data: [{ championId: 1, championPoints: 50000 }] });

        const result = await getFullLolProfile('p1', 'euw1');

        expect(result.rankedSolo).not.toBeNull();
        expect(result.topChampions).toHaveLength(1);
    });

    test('getFullLolProfile handles API failures gracefully', async () => {
        axios.get.mockRejectedValue(new Error('Network error'));

        const result = await getFullLolProfile('p1', 'euw1');

        expect(result.account).toBeNull();
        expect(result.topChampions).toEqual([]);
    });
});
