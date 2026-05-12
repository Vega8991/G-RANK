import apiClient from '../../services/apiClient';
import { getNavInfo, isTokenValid, login, logout, register, getProfile } from '../../services/authService';

vi.mock('../../services/apiClient', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
    }
}));

function setAuthCookie(username: string, role: string, expOffsetSeconds = 3600) {
    const exp = Math.floor(Date.now() / 1000) + expOffsetSeconds;
    const value = JSON.stringify({ username, role, exp });
    document.cookie = `auth_info=${encodeURIComponent(value)}`;
}

function clearAuthCookie() {
    document.cookie = 'auth_info=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
}

describe('authService', () => {
    const mockedApiClient = vi.mocked(apiClient);

    beforeEach(() => {
        vi.clearAllMocks();
        clearAuthCookie();
    });

    afterEach(() => {
        clearAuthCookie();
    });

    describe('getNavInfo', () => {
        it('returns null when there is no auth_info cookie', () => {
            expect(getNavInfo()).toBeNull();
        });

        it('returns username and role when cookie is valid', () => {
            setAuthCookie('vega', 'USER');
            expect(getNavInfo()).toEqual({ username: 'vega', role: 'USER' });
        });

        it('returns null when cookie is expired', () => {
            setAuthCookie('vega', 'USER', -100);
            expect(getNavInfo()).toBeNull();
        });

        it('returns ADMIN role correctly', () => {
            setAuthCookie('admin', 'ADMIN');
            expect(getNavInfo()).toEqual({ username: 'admin', role: 'ADMIN' });
        });
    });

    describe('isTokenValid', () => {
        it('returns false when there is no cookie', () => {
            expect(isTokenValid()).toBe(false);
        });

        it('returns true when cookie is valid', () => {
            setAuthCookie('vega', 'USER');
            expect(isTokenValid()).toBe(true);
        });

        it('returns false when cookie is expired', () => {
            setAuthCookie('vega', 'USER', -1);
            expect(isTokenValid()).toBe(false);
        });
    });

    describe('login', () => {
        it('calls POST /auth/login with email and password', async () => {
            mockedApiClient.post.mockResolvedValueOnce({ data: { success: true, message: 'Login successful' } });

            await login('vega@test.com', '12345678');

            expect(mockedApiClient.post).toHaveBeenCalledWith('/auth/login', {
                email: 'vega@test.com',
                password: '12345678',
            });
        });

        it('dispatches AUTH_CHANGE_EVENT after a successful login', async () => {
            mockedApiClient.post.mockResolvedValueOnce({ data: { success: true } });
            const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

            await login('vega@test.com', '12345678');

            expect(dispatchSpy).toHaveBeenCalled();
        });

        it('throws when the login request fails', async () => {
            mockedApiClient.post.mockRejectedValueOnce(new Error('Network error'));

            await expect(login('vega@test.com', 'wrongpassword')).rejects.toThrow('Network error');
        });
    });

    describe('logout', () => {
        it('calls POST /auth/logout', async () => {
            mockedApiClient.post.mockResolvedValueOnce({ data: { success: true } });

            await logout();

            expect(mockedApiClient.post).toHaveBeenCalledWith('/auth/logout');
        });

        it('dispatches AUTH_CHANGE_EVENT after logout', async () => {
            mockedApiClient.post.mockResolvedValueOnce({ data: { success: true } });
            const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

            await logout();

            expect(dispatchSpy).toHaveBeenCalled();
        });
    });

    describe('register', () => {
        it('calls POST /auth/register with username, email and password', async () => {
            mockedApiClient.post.mockResolvedValueOnce({ data: { success: true, message: 'Registered!' } });

            const result = await register('vega', 'vega@test.com', '12345678');

            expect(mockedApiClient.post).toHaveBeenCalledWith('/auth/register', {
                username: 'vega',
                email: 'vega@test.com',
                password: '12345678',
            });
            expect(result).toEqual({ success: true, message: 'Registered!' });
        });
    });

    describe('getProfile', () => {
        it('calls GET /auth/profile and returns the user', async () => {
            const fakeUser = { _id: '1', username: 'vega', email: 'vega@test.com' };
            mockedApiClient.get.mockResolvedValueOnce({ data: { user: fakeUser } });

            const result = await getProfile();

            expect(mockedApiClient.get).toHaveBeenCalledWith('/auth/profile');
            expect(result).toEqual({ user: fakeUser });
        });
    });
});
