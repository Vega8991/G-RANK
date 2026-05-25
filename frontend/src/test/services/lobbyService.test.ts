import apiClient from '../../services/apiClient';
import {
    createLobby,
    getAllLobbies,
    registerToLobby,
    leaveLobby,
    getMyLobbies,
    syncParticipantCounts,
} from '../../services/lobbyService';

vi.mock('../../services/apiClient', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
    }
}));

describe('lobbyService', () => {
    const mockedApiClient = vi.mocked(apiClient);

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('createLobby calls POST /lobbies with the correct fields', async () => {
        mockedApiClient.post.mockResolvedValueOnce({ data: { lobby: { _id: '1', name: 'My Lobby' } } });

        const result = await createLobby('My Lobby', 'A lobby', 8, '$50', '2026-12-01', '2026-12-02');

        expect(mockedApiClient.post).toHaveBeenCalledWith(
            '/lobbies',
            expect.objectContaining({
                name: 'My Lobby',
                description: 'A lobby',
                maxParticipants: 8,
                prizePool: '$50',
                game: 'pokemon_showdown',
            })
        );
        expect(result).toEqual({ lobby: { _id: '1', name: 'My Lobby' } });
    });

    it('createLobby uses Date objects for the dates', async () => {
        mockedApiClient.post.mockResolvedValueOnce({ data: { lobby: {} } });

        await createLobby('My Lobby', 'Desc', 4, '$0', '2026-12-01', '2026-12-02');

        const sentBody = (mockedApiClient.post as ReturnType<typeof vi.fn>).mock.calls[0][1] as Record<string, unknown>;
        expect(sentBody.registrationDeadline).toBeInstanceOf(Date);
        expect(sentBody.matchDateTime).toBeInstanceOf(Date);
    });

    it('createLobby uses default dates when none are provided', async () => {
        mockedApiClient.post.mockResolvedValueOnce({ data: { lobby: {} } });

        const before = Date.now();
        await createLobby('My Lobby', 'Desc', 4, '$0');
        const after = Date.now();

        const sentBody = (mockedApiClient.post as ReturnType<typeof vi.fn>).mock.calls[0][1] as Record<string, unknown>;
        const deadline = (sentBody.registrationDeadline as Date).getTime();
        const matchTime = (sentBody.matchDateTime as Date).getTime();

        expect(deadline).toBeGreaterThanOrEqual(before + 24 * 60 * 60 * 1000 - 100);
        expect(deadline).toBeLessThanOrEqual(after  + 24 * 60 * 60 * 1000 + 100);
        expect(matchTime).toBeGreaterThanOrEqual(before + 48 * 60 * 60 * 1000 - 100);
        expect(matchTime).toBeLessThanOrEqual(after  + 48 * 60 * 60 * 1000 + 100);
    });

    it('getAllLobbies calls GET /lobbies', async () => {
        mockedApiClient.get.mockResolvedValueOnce({ data: { lobbies: [] } });

        const result = await getAllLobbies();

        expect(mockedApiClient.get).toHaveBeenCalledWith('/lobbies?page=1&limit=10');
        expect(result).toEqual({ lobbies: [] });
    });

    it('registerToLobby calls POST /lobby-participants/register with the lobbyId', async () => {
        mockedApiClient.post.mockResolvedValueOnce({ data: { message: 'joined' } });

        const result = await registerToLobby('lobby-123');

        expect(mockedApiClient.post).toHaveBeenCalledWith(
            '/lobby-participants/register',
            { lobbyId: 'lobby-123' }
        );
        expect(result).toEqual({ message: 'joined' });
    });

    it('leaveLobby calls POST /lobby-participants/leave with the lobbyId', async () => {
        mockedApiClient.post.mockResolvedValueOnce({ data: { message: 'left' } });

        const result = await leaveLobby('lobby-123');

        expect(mockedApiClient.post).toHaveBeenCalledWith(
            '/lobby-participants/leave',
            { lobbyId: 'lobby-123' }
        );
        expect(result).toEqual({ message: 'left' });
    });

    it('getMyLobbies calls GET /lobby-participants/my-lobbies', async () => {
        mockedApiClient.get.mockResolvedValueOnce({ data: { lobbies: [{ _id: '1' }] } });

        const result = await getMyLobbies();

        expect(mockedApiClient.get).toHaveBeenCalledWith('/lobby-participants/my-lobbies');
        expect(result).toEqual({ lobbies: [{ _id: '1' }] });
    });

    it('syncParticipantCounts calls POST /lobbies/sync-counts', async () => {
        mockedApiClient.post.mockResolvedValueOnce({ data: { message: 'synced' } });

        const result = await syncParticipantCounts();

        expect(mockedApiClient.post).toHaveBeenCalledWith('/lobbies/sync-counts');
        expect(result).toEqual({ message: 'synced' });
    });
});
