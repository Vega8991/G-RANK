import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { useAdmin } from '../../hooks/useAdmin';
import { getProfile, logout } from '../../services/authService';
import {
    getAdminStats, adminGetUsers, adminCreateUser, adminUpdateUser, adminDeleteUser,
    adminGetLobbies, adminUpdateLobby, adminDeleteLobby,
} from '../../services/adminService';

vi.mock('../../services/authService', () => ({
    getProfile: vi.fn(),
    logout: vi.fn(),
}));

vi.mock('../../services/adminService', () => ({
    getAdminStats:    vi.fn(),
    adminGetUsers:    vi.fn(),
    adminCreateUser:  vi.fn(),
    adminUpdateUser:  vi.fn(),
    adminDeleteUser:  vi.fn(),
    adminGetLobbies:  vi.fn(),
    adminUpdateLobby: vi.fn(),
    adminDeleteLobby: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
    return { ...actual, useNavigate: () => mockNavigate };
});

const mockedGetProfile    = vi.mocked(getProfile);
const mockedLogout        = vi.mocked(logout);
const mockedGetAdminStats = vi.mocked(getAdminStats);
const mockedGetUsers      = vi.mocked(adminGetUsers);
const mockedGetLobbies    = vi.mocked(adminGetLobbies);
const mockedCreateUser    = vi.mocked(adminCreateUser);
const mockedUpdateUser    = vi.mocked(adminUpdateUser);
const mockedDeleteUser    = vi.mocked(adminDeleteUser);
const mockedUpdateLobby   = vi.mocked(adminUpdateLobby);
const mockedDeleteLobby   = vi.mocked(adminDeleteLobby);

const mockStats = { totalUsers: 5, totalLobbies: 3, activeLobbies: 1, suspendedUsers: 0 };

const mockAdminUser = {
    _id: 'admin-1', username: 'AdminUser', email: 'admin@test.com',
    role: 'ADMIN' as const, status: 'active' as const, mmr: 0, rank: 'Elite', updatedAt: '',
};

const mockLobby = {
    _id: 'lobby-1', name: 'Test Cup', description: 'desc', game: 'pokemon_showdown',
    maxParticipants: 8, currentParticipants: 2, registrationDeadline: '', matchDateTime: '',
    status: 'open' as const, createdBy: 'admin-1', createdAt: '', updatedAt: '',
};

function wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(MemoryRouter, { initialEntries: ['/admin'] }, children);
}

describe('useAdmin', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockedGetProfile.mockResolvedValue({ user: mockAdminUser } as ReturnType<typeof getProfile> extends Promise<infer T> ? T : never);
        mockedGetAdminStats.mockResolvedValue(mockStats);
        mockedGetUsers.mockResolvedValue([mockAdminUser]);
        mockedGetLobbies.mockResolvedValue([mockLobby]);
        mockedLogout.mockResolvedValue(undefined as never);
    });

    it('loads stats, users and lobbies on mount', async () => {
        const { result } = renderHook(() => useAdmin(), { wrapper });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.stats).toEqual(mockStats);
        expect(result.current.users).toHaveLength(1);
        expect(result.current.lobbies).toHaveLength(1);
    });

    it('sets currentUser after mount', async () => {
        const { result } = renderHook(() => useAdmin(), { wrapper });

        await waitFor(() => {
            expect(result.current.currentUser?.username).toBe('AdminUser');
        });
    });

    it('redirects to /dashboard when user is not ADMIN', async () => {
        mockedGetProfile.mockResolvedValueOnce({
            user: { ...mockAdminUser, role: 'USER' },
        } as ReturnType<typeof getProfile> extends Promise<infer T> ? T : never);

        renderHook(() => useAdmin(), { wrapper });

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
        });
    });

    it('redirects to /login when getProfile throws', async () => {
        mockedGetProfile.mockRejectedValueOnce(new Error('Unauthorized'));

        renderHook(() => useAdmin(), { wrapper });

        await waitFor(() => {
            expect(mockedLogout).toHaveBeenCalled();
            expect(mockNavigate).toHaveBeenCalledWith('/login');
        });
    });

    it('shows toast on loadAll failure', async () => {
        mockedGetAdminStats.mockRejectedValueOnce(new Error('Server down'));

        const { result } = renderHook(() => useAdmin(), { wrapper });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.toast).toEqual({ message: 'Failed to load data', ok: false });
    });

    it('handleSaveUser creates a new user', async () => {
        const newUser = { ...mockAdminUser, _id: 'new-1', username: 'NewUser' };
        mockedCreateUser.mockResolvedValueOnce(newUser);
        // Second loadAll call after create
        mockedGetUsers.mockResolvedValue([mockAdminUser, newUser]);

        const { result } = renderHook(() => useAdmin(), { wrapper });
        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            await result.current.handleSaveUser('__create__', {
                username: 'NewUser', email: 'new@test.com', password: 'pass123',
                role: 'USER', rank: 'Bronze', mmr: 250, status: 'active',
            });
        });

        expect(mockedCreateUser).toHaveBeenCalled();
        expect(result.current.toast?.message).toBe('User created');
    });

    it('handleSaveUser updates existing user', async () => {
        const updated = { ...mockAdminUser, username: 'UpdatedName' };
        mockedUpdateUser.mockResolvedValueOnce(updated);

        const { result } = renderHook(() => useAdmin(), { wrapper });
        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            await result.current.handleSaveUser(mockAdminUser, { username: 'UpdatedName' });
        });

        expect(mockedUpdateUser).toHaveBeenCalledWith('admin-1', { username: 'UpdatedName' });
        expect(result.current.toast?.message).toBe('User updated');
    });

    it('handleDeleteUser removes user and shows toast', async () => {
        const { result } = renderHook(() => useAdmin(), { wrapper });
        await waitFor(() => expect(result.current.loading).toBe(false));

        mockedDeleteUser.mockResolvedValueOnce(undefined as never);

        await act(async () => {
            await result.current.handleDeleteUser(mockAdminUser);
        });

        expect(mockedDeleteUser).toHaveBeenCalledWith('admin-1');
        expect(result.current.toast?.message).toBe('User deleted');
    });

    it('handleSaveLobby updates lobby and shows toast', async () => {
        const updated = { ...mockLobby, name: 'Updated Cup' };
        mockedUpdateLobby.mockResolvedValueOnce(updated);

        const { result } = renderHook(() => useAdmin(), { wrapper });
        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            await result.current.handleSaveLobby(mockLobby, {
                name: 'Updated Cup', description: 'desc', game: 'pokemon_showdown',
                maxParticipants: 8, status: 'open', prizePool: '',
            });
        });

        expect(mockedUpdateLobby).toHaveBeenCalledWith('lobby-1', expect.objectContaining({ name: 'Updated Cup' }));
        expect(result.current.toast?.message).toBe('Tournament updated');
    });

    it('handleDeleteLobby removes lobby and shows toast', async () => {
        mockedDeleteLobby.mockResolvedValueOnce(undefined as never);

        const { result } = renderHook(() => useAdmin(), { wrapper });
        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            await result.current.handleDeleteLobby(mockLobby);
        });

        expect(mockedDeleteLobby).toHaveBeenCalledWith('lobby-1');
        expect(result.current.toast?.message).toBe('Tournament deleted');
    });

    it('handleRefresh calls loadAll and shows toast', async () => {
        const { result } = renderHook(() => useAdmin(), { wrapper });
        await waitFor(() => expect(result.current.loading).toBe(false));

        vi.clearAllMocks();
        mockedGetAdminStats.mockResolvedValue(mockStats);
        mockedGetUsers.mockResolvedValue([mockAdminUser]);
        mockedGetLobbies.mockResolvedValue([mockLobby]);

        await act(async () => {
            await result.current.handleRefresh();
        });

        expect(mockedGetAdminStats).toHaveBeenCalled();
        expect(result.current.toast?.message).toBe('Data refreshed');
    });
});
