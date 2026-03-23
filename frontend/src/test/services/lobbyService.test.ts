import axios from 'axios';
import { API_URL } from '../../config/api';
import {
    createLobby,
    getAllLobbies,
    registerToLobby,
    leaveLobby,
    getMyLobbies,
    syncParticipantCounts
} from '../../services/lobbyService';
import { getToken } from '../../services/authService';

vi.mock('axios');
vi.mock('../../services/authService', () => ({
    getToken: vi.fn()
}));

describe('lobbyService', () => {

    const mockedAxios = vi.mocked(axios);
    const mockedGetToken = vi.mocked(getToken);

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('createLobby throws when token is missing', async () => {
        mockedGetToken.mockReturnValueOnce(null);

        await expect(
            createLobby('Lobby test', 'Desc', 8, '$50')
        ).rejects.toThrow('No authentication token found');
    });

    it('createLobby sends request with auth header and payload', async () => {
        mockedGetToken.mockReturnValueOnce('token-123');
        mockedAxios.post.mockResolvedValueOnce({ data: { lobby: { id: '1' } } });

        const result = await createLobby('My Lobby', 'Desc', 8, '$50', '2026-03-30', '2026-03-31');

        expect(mockedAxios.post).toHaveBeenCalledWith(
            `${API_URL}/lobbies`,
            expect.objectContaining({
                name: 'My Lobby',
                description: 'Desc',
                game: 'pokemon_showdown',
                maxParticipants: 8,
                prizePool: '$50'
            }),
            {
                headers: {
                    Authorization: 'Bearer token-123'
                }
            }
        );
        expect(result).toEqual({ lobby: { id: '1' } });
    });

    it('getAllLobbies calls public lobbies endpoint', async () => {
        mockedAxios.get.mockResolvedValueOnce({ data: { lobbies: [] } });

        const result = await getAllLobbies();

        expect(mockedAxios.get).toHaveBeenCalledWith(`${API_URL}/lobbies`);
        expect(result).toEqual({ lobbies: [] });
    });

    it('registerToLobby sends lobbyId and token', async () => {
        mockedGetToken.mockReturnValueOnce('token-123');
        mockedAxios.post.mockResolvedValueOnce({ data: { message: 'joined' } });

        const result = await registerToLobby('lobby-1');

        expect(mockedAxios.post).toHaveBeenCalledWith(
            `${API_URL}/lobby-participants/register`,
            { lobbyId: 'lobby-1' },
            {
                headers: {
                    Authorization: 'Bearer token-123'
                }
            }
        );
        expect(result).toEqual({ message: 'joined' });
    });

    it('leaveLobby sends lobbyId and token', async () => {
        mockedGetToken.mockReturnValueOnce('token-123');
        mockedAxios.post.mockResolvedValueOnce({ data: { message: 'left' } });

        const result = await leaveLobby('lobby-1');

        expect(mockedAxios.post).toHaveBeenCalledWith(
            `${API_URL}/lobby-participants/leave`,
            { lobbyId: 'lobby-1' },
            {
                headers: {
                    Authorization: 'Bearer token-123'
                }
            }
        );
        expect(result).toEqual({ message: 'left' });
    });

    it('getMyLobbies sends authenticated get request', async () => {
        mockedGetToken.mockReturnValueOnce('token-123');
        mockedAxios.get.mockResolvedValueOnce({ data: { lobbies: [{ id: '1' }] } });

        const result = await getMyLobbies();

        expect(mockedAxios.get).toHaveBeenCalledWith(`${API_URL}/lobby-participants/my-lobbies`, {
            headers: {
                Authorization: 'Bearer token-123'
            }
        });
        expect(result).toEqual({ lobbies: [{ id: '1' }] });
    });

    it('syncParticipantCounts calls sync endpoint', async () => {
        mockedAxios.post.mockResolvedValueOnce({ data: { message: 'synced' } });

        const result = await syncParticipantCounts();

        expect(mockedAxios.post).toHaveBeenCalledWith(`${API_URL}/lobbies/sync-counts`);
        expect(result).toEqual({ message: 'synced' });
    });

});
