import apiClient from '../../services/apiClient';
import {
    linkRiotAccount,
    unlinkRiotAccount,
    getMyRiotProfile,
    getRiotProfileByRiotId,
    submitLolMatch,
    getRiotOAuthUrl,
} from '../../services/riotService';

vi.mock('../../services/apiClient', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        delete: vi.fn(),
    },
}));

describe('riotService', () => {
    const mockedApiClient = vi.mocked(apiClient);

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('linkRiotAccount posts to /riot/link with gameName, tagLine, platform', async () => {
        const responseData = { success: true, message: 'Linked', riotAccount: { gameName: 'Player', tagLine: 'EUW' } };
        mockedApiClient.post.mockResolvedValueOnce({ data: responseData });

        const result = await linkRiotAccount('Player', 'EUW', 'euw1');

        expect(mockedApiClient.post).toHaveBeenCalledWith('/riot/link', {
            gameName: 'Player',
            tagLine: 'EUW',
            platform: 'euw1',
        });
        expect(result).toEqual(responseData);
    });

    it('unlinkRiotAccount calls DELETE /riot/unlink', async () => {
        const responseData = { success: true, message: 'Unlinked' };
        mockedApiClient.delete.mockResolvedValueOnce({ data: responseData });

        const result = await unlinkRiotAccount();

        expect(mockedApiClient.delete).toHaveBeenCalledWith('/riot/unlink');
        expect(result).toEqual(responseData);
    });

    it('getMyRiotProfile calls GET /riot/profile', async () => {
        const responseData = { success: true, profile: { gameName: 'Player', tagLine: 'EUW' } };
        mockedApiClient.get.mockResolvedValueOnce({ data: responseData });

        const result = await getMyRiotProfile();

        expect(mockedApiClient.get).toHaveBeenCalledWith('/riot/profile');
        expect(result).toEqual(responseData);
    });

    it('getRiotProfileByRiotId calls GET /riot/profile/:riotId with platform param', async () => {
        const responseData = { success: true, profile: { gameName: 'Player', tagLine: 'NA1' } };
        mockedApiClient.get.mockResolvedValueOnce({ data: responseData });

        const result = await getRiotProfileByRiotId('Player#NA1', 'na1');

        expect(mockedApiClient.get).toHaveBeenCalledWith(
            `/riot/profile/${encodeURIComponent('Player#NA1')}`,
            { params: { platform: 'na1' } }
        );
        expect(result).toEqual(responseData);
    });

    it('getRiotProfileByRiotId uses na1 as default platform', async () => {
        mockedApiClient.get.mockResolvedValueOnce({ data: { success: true, profile: {} } });

        await getRiotProfileByRiotId('Player#NA1');

        expect(mockedApiClient.get).toHaveBeenCalledWith(
            expect.any(String),
            { params: { platform: 'na1' } }
        );
    });

    it('submitLolMatch posts lobbyId and matchId to /riot/submit-lol-match', async () => {
        const responseData = { success: true };
        mockedApiClient.post.mockResolvedValueOnce({ data: responseData });

        const result = await submitLolMatch('lobby-1', 'match-abc');

        expect(mockedApiClient.post).toHaveBeenCalledWith('/riot/submit-lol-match', {
            lobbyId: 'lobby-1',
            matchId: 'match-abc',
        });
        expect(result).toEqual(responseData);
    });

    it('getRiotOAuthUrl calls GET /riot/oauth/url with platform param', async () => {
        const responseData = { success: true, url: 'https://auth.riotgames.com/...' };
        mockedApiClient.get.mockResolvedValueOnce({ data: responseData });

        const result = await getRiotOAuthUrl('euw1');

        expect(mockedApiClient.get).toHaveBeenCalledWith('/riot/oauth/url', { params: { platform: 'euw1' } });
        expect(result).toEqual(responseData);
    });

    it('linkRiotAccount throws when request fails', async () => {
        mockedApiClient.post.mockRejectedValueOnce(new Error('Server error'));

        await expect(linkRiotAccount('Player', 'EUW', 'euw1')).rejects.toThrow('Server error');
    });
});
