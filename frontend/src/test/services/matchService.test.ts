import apiClient from '../../services/apiClient';
import { submitReplay } from '../../services/matchService';

vi.mock('../../services/apiClient', () => ({
    default: {
        post: vi.fn(),
    }
}));

describe('matchService', () => {
    const mockedApiClient = vi.mocked(apiClient);

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('calls POST /match-results/submit-replay with lobbyId and replayUrl', async () => {
        mockedApiClient.post.mockResolvedValueOnce({ data: { success: true } });

        const result = await submitReplay('lobby-1', 'https://replay.url');

        expect(mockedApiClient.post).toHaveBeenCalledWith(
            '/match-results/submit-replay',
            {
                lobbyId: 'lobby-1',
                replayUrl: 'https://replay.url',
            }
        );
        expect(result).toEqual({ success: true });
    });

    it('throws when the request fails', async () => {
        mockedApiClient.post.mockRejectedValueOnce(new Error('Server error'));

        await expect(submitReplay('lobby-1', 'https://replay.url')).rejects.toThrow('Server error');
    });
});
