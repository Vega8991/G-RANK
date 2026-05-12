import { renderHook, act, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import { useDashboard } from '../../hooks/useDashboard';
import { getProfile, logout } from '../../services/authService';
import { getMyLobbies } from '../../services/lobbyService';

vi.mock('../../services/authService', () => ({
    getProfile: vi.fn(),
    logout: vi.fn(),
}));

vi.mock('../../services/lobbyService', () => ({
    getMyLobbies: vi.fn(),
}));

const mockedGetProfile = vi.mocked(getProfile);
const mockedLogout = vi.mocked(logout);
const mockedGetMyLobbies = vi.mocked(getMyLobbies);

function wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(MemoryRouter, { initialEntries: ['/dashboard'] }, children);
}

function wrapperWithParams(search: string) {
    return function ({ children }: { children: React.ReactNode }) {
        return React.createElement(MemoryRouter, { initialEntries: [`/dashboard${search}`] }, children);
    };
}

describe('useDashboard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockedGetMyLobbies.mockResolvedValue({ lobbies: [] });
    });

    it('loads user profile on mount', async () => {
        const user = { _id: 'u1', username: 'vega', role: 'USER' };
        mockedGetProfile.mockResolvedValueOnce({ user } as ReturnType<typeof getProfile> extends Promise<infer T> ? T : never);

        const { result } = renderHook(() => useDashboard(), { wrapper });

        await waitFor(() => {
            expect(result.current.user).toEqual(user);
        });
    });

    it('sets loadError to true when profile fetch fails with non-401/403', async () => {
        mockedGetProfile.mockRejectedValueOnce({ response: { status: 500 } });

        const { result } = renderHook(() => useDashboard(), { wrapper });

        await waitFor(() => {
            expect(result.current.loadError).toBe(true);
        });
    });

    it('calls logout and redirects to /login on 401', async () => {
        mockedGetProfile.mockRejectedValueOnce({ response: { status: 401 } });
        mockedLogout.mockResolvedValueOnce(undefined);

        renderHook(() => useDashboard(), { wrapper });

        await waitFor(() => {
            expect(mockedLogout).toHaveBeenCalled();
        });
    });

    it('calls logout and redirects to /login on 403', async () => {
        mockedGetProfile.mockRejectedValueOnce({ response: { status: 403 } });
        mockedLogout.mockResolvedValueOnce(undefined);

        renderHook(() => useDashboard(), { wrapper });

        await waitFor(() => {
            expect(mockedLogout).toHaveBeenCalled();
        });
    });

    it('loads lobbies on mount', async () => {
        const lobbies = [{ _id: 'l1', name: 'Tournament 1' }];
        mockedGetProfile.mockResolvedValueOnce({ user: { _id: 'u1' } } as ReturnType<typeof getProfile> extends Promise<infer T> ? T : never);
        mockedGetMyLobbies.mockResolvedValueOnce({ lobbies } as ReturnType<typeof getMyLobbies> extends Promise<infer T> ? T : never);

        const { result } = renderHook(() => useDashboard(), { wrapper });

        await waitFor(() => {
            expect(result.current.lobbies).toEqual(lobbies);
        });
    });

    it('sets oauthMsg to success when riot_linked=1 query param is present', async () => {
        mockedGetProfile.mockResolvedValueOnce({ user: { _id: 'u1' } } as ReturnType<typeof getProfile> extends Promise<infer T> ? T : never);

        const { result } = renderHook(
            () => useDashboard(),
            { wrapper: wrapperWithParams('?riot_linked=1') }
        );

        await waitFor(() => {
            expect(result.current.oauthMsg?.ok).toBe(true);
            expect(result.current.oauthMsg?.text).toMatch(/linked successfully/i);
        });
    });

    it('sets oauthMsg to error when riot_error query param is present', async () => {
        mockedGetProfile.mockResolvedValueOnce({ user: { _id: 'u1' } } as ReturnType<typeof getProfile> extends Promise<infer T> ? T : never);

        const { result } = renderHook(
            () => useDashboard(),
            { wrapper: wrapperWithParams('?riot_error=access_denied') }
        );

        await waitFor(() => {
            expect(result.current.oauthMsg?.ok).toBe(false);
            expect(result.current.oauthMsg?.text).toBe('Riot login cancelled.');
        });
    });

    it('handleLogout calls logout and sets state', async () => {
        mockedGetProfile.mockResolvedValueOnce({ user: { _id: 'u1' } } as ReturnType<typeof getProfile> extends Promise<infer T> ? T : never);
        mockedLogout.mockResolvedValueOnce(undefined);

        const { result } = renderHook(() => useDashboard(), { wrapper });

        await waitFor(() => expect(result.current.user).toBeTruthy());

        await act(async () => {
            await result.current.handleLogout();
        });

        expect(mockedLogout).toHaveBeenCalled();
    });
});
