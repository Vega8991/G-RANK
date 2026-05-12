import { renderHook, waitFor } from '@testing-library/react';
import { useLobbies } from '../../hooks/useLobbies';
import {
    getAllLobbies,
    getMyLobbies,
    registerToLobby,
    leaveLobby,
    createLobby,
    syncParticipantCounts,
} from '../../services/lobbyService';
import { submitReplay } from '../../services/matchService';
import { getProfile } from '../../services/authService';

vi.mock('../../services/lobbyService', () => ({
    getAllLobbies: vi.fn(),
    getMyLobbies: vi.fn(),
    registerToLobby: vi.fn(),
    leaveLobby: vi.fn(),
    createLobby: vi.fn(),
    syncParticipantCounts: vi.fn(),
}));

vi.mock('../../services/matchService', () => ({
    submitReplay: vi.fn(),
}));

vi.mock('../../services/authService', () => ({
    getProfile: vi.fn(),
}));

const mockedGetAllLobbies = vi.mocked(getAllLobbies);
const mockedGetMyLobbies = vi.mocked(getMyLobbies);
const mockedRegisterToLobby = vi.mocked(registerToLobby);
const mockedLeaveLobby = vi.mocked(leaveLobby);
const mockedCreateLobby = vi.mocked(createLobby);
const mockedSyncParticipantCounts = vi.mocked(syncParticipantCounts);
const mockedSubmitReplay = vi.mocked(submitReplay);
const mockedGetProfile = vi.mocked(getProfile);

const lobby1 = { _id: 'l1', name: 'Tournament 1' };
const lobby2 = { _id: 'l2', name: 'My Tournament' };

function setupDefaults() {
    mockedSyncParticipantCounts.mockResolvedValue(undefined);
    mockedGetAllLobbies.mockResolvedValue({ lobbies: [lobby1] } as ReturnType<typeof getAllLobbies> extends Promise<infer T> ? T : never);
    mockedGetMyLobbies.mockResolvedValue({ lobbies: [lobby2] } as ReturnType<typeof getMyLobbies> extends Promise<infer T> ? T : never);
    mockedGetProfile.mockResolvedValue({ user: { riotPuuid: 'puuid-123' } } as ReturnType<typeof getProfile> extends Promise<infer T> ? T : never);
}

describe('useLobbies', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        setupDefaults();
    });

    it('loads all lobbies and my lobbies on mount', async () => {
        const { result } = renderHook(() => useLobbies());

        await waitFor(() => {
            expect(result.current.lobbies).toEqual([lobby1]);
            expect(result.current.myLobbies).toEqual([lobby2]);
        });
    });

    it('sets userRiotLinked to true when user has riotPuuid', async () => {
        const { result } = renderHook(() => useLobbies());

        await waitFor(() => {
            expect(result.current.userRiotLinked).toBe(true);
        });
    });

    it('sets userRiotLinked to false when user has no riotPuuid', async () => {
        mockedGetProfile.mockResolvedValueOnce({ user: { riotPuuid: null } } as ReturnType<typeof getProfile> extends Promise<infer T> ? T : never);

        const { result } = renderHook(() => useLobbies());

        await waitFor(() => {
            expect(result.current.userRiotLinked).toBe(false);
        });
    });

    it('handleRegister calls registerToLobby and reloads data', async () => {
        mockedRegisterToLobby.mockResolvedValueOnce(undefined);

        const { result } = renderHook(() => useLobbies());

        await waitFor(() => expect(result.current.lobbies).toHaveLength(1));

        await result.current.handleRegister('l1');

        expect(mockedRegisterToLobby).toHaveBeenCalledWith('l1');
    });

    it('handleRegister calls registerToLobby with the correct id', async () => {
        mockedRegisterToLobby.mockRejectedValueOnce({
            response: { data: { message: 'Already registered' } },
        });

        const { result } = renderHook(() => useLobbies());

        await waitFor(() => expect(result.current.lobbies).toHaveLength(1));

        await result.current.handleRegister('l1');

        expect(mockedRegisterToLobby).toHaveBeenCalledWith('l1');
    });

    it('handleLeave calls leaveLobby and reloads data', async () => {
        mockedLeaveLobby.mockResolvedValueOnce(undefined);

        const { result } = renderHook(() => useLobbies());

        await waitFor(() => expect(result.current.lobbies).toHaveLength(1));

        await result.current.handleLeave('l1');

        expect(mockedLeaveLobby).toHaveBeenCalledWith('l1');
    });

    it('handleCreate calls createLobby with correct params', async () => {
        mockedCreateLobby.mockResolvedValueOnce({} as ReturnType<typeof createLobby> extends Promise<infer T> ? T : never);

        const { result } = renderHook(() => useLobbies());

        await waitFor(() => expect(result.current.lobbies).toHaveLength(1));

        await result.current.handleCreate({
            name: 'New Tourney',
            description: 'A test tournament',
            maxParticipants: 8,
            prizePool: '$100',
            registrationDeadline: '2026-06-01',
            matchDateTime: '2026-06-15',
            game: 'league_of_legends',
        });

        expect(mockedCreateLobby).toHaveBeenCalledWith(
            'New Tourney', 'A test tournament', 8, '$100', '2026-06-01', '2026-06-15', 'league_of_legends'
        );
    });

    it('handleSubmitReplay calls submitReplay and sets message', async () => {
        const replayResult = { success: true, winner: 'vega' };
        mockedSubmitReplay.mockResolvedValueOnce(replayResult as ReturnType<typeof submitReplay> extends Promise<infer T> ? T : never);

        const { result } = renderHook(() => useLobbies());

        await waitFor(() => expect(result.current.lobbies).toHaveLength(1));

        await result.current.handleSubmitReplay('l1', 'https://replay.url');

        expect(mockedSubmitReplay).toHaveBeenCalledWith('l1', 'https://replay.url');
        await waitFor(() => {
            expect(result.current.result).toEqual(replayResult);
        });
    });
});
