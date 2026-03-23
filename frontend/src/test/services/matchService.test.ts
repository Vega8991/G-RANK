import axios from 'axios';
import { API_URL } from '../../config/api';
import { submitReplay } from '../../services/matchService';
import { getToken } from '../../services/authService';

vi.mock('axios');
vi.mock('../../services/authService', () => ({
    getToken: vi.fn()
}));

describe('matchService', () => {

    const mockedAxios = vi.mocked(axios);
    const mockedGetToken = vi.mocked(getToken);

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('throws when no token is available', async () => {
        mockedGetToken.mockReturnValueOnce(null);

        await expect(submitReplay('lobby-1', 'https://replay.url')).rejects.toThrow('No authentication token found');
    });

    it('posts replay with bearer token', async () => {
        mockedGetToken.mockReturnValueOnce('token-xyz');
        mockedAxios.post.mockResolvedValueOnce({ data: { success: true } });

        const result = await submitReplay('lobby-1', 'https://replay.url');

        expect(mockedAxios.post).toHaveBeenCalledWith(
            `${API_URL}/match-results/submit-replay`,
            {
                lobbyId: 'lobby-1',
                replayUrl: 'https://replay.url'
            },
            {
                headers: {
                    Authorization: 'Bearer token-xyz'
                }
            }
        );
        expect(result).toEqual({ success: true });
    });

});
