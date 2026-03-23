import axios from 'axios';
import { API_URL } from '../../config/api';
import { register, login, logout, getProfile, getToken } from '../../services/authService';

vi.mock('axios');

describe('authService', () => {

    const mockedAxios = vi.mocked(axios, { deep: true });

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('register sends username, email and password', async () => {
        mockedAxios.post.mockResolvedValueOnce({ data: { message: 'ok' } });

        const result = await register('vega', 'vega@test.com', '12345678');

        expect(mockedAxios.post).toHaveBeenCalledWith(`${API_URL}/auth/register`, {
            username: 'vega',
            email: 'vega@test.com',
            password: '12345678'
        });
        expect(result).toEqual({ message: 'ok' });
    });

    it('login stores token and user when response includes token', async () => {
        const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
        mockedAxios.post.mockResolvedValueOnce({
            data: {
                token: 'abc-token',
                user: { id: 1, username: 'vega' }
            }
        });

        const result = await login('vega@test.com', '12345678');

        expect(localStorage.getItem('token')).toBe('abc-token');
        expect(localStorage.getItem('user')).toBe(JSON.stringify({ id: 1, username: 'vega' }));
        expect(dispatchSpy).toHaveBeenCalled();
        expect(result.token).toBe('abc-token');
    });

    it('login does not store token when token is missing', async () => {
        mockedAxios.post.mockResolvedValueOnce({ data: { user: { id: 1 } } });

        await login('vega@test.com', '12345678');

        expect(localStorage.getItem('token')).toBeNull();
        expect(localStorage.getItem('user')).toBeNull();
    });

    it('logout removes auth data from localStorage', () => {
        localStorage.setItem('token', 'abc-token');
        localStorage.setItem('user', JSON.stringify({ id: 1 }));

        logout();

        expect(localStorage.getItem('token')).toBeNull();
        expect(localStorage.getItem('user')).toBeNull();
    });

    it('getProfile throws if no token exists', async () => {
        await expect(getProfile()).rejects.toThrow('No token found');
    });

    it('getProfile sends bearer token in headers', async () => {
        localStorage.setItem('token', 'abc-token');
        mockedAxios.get.mockResolvedValueOnce({ data: { user: { username: 'vega' } } });

        const result = await getProfile();

        expect(mockedAxios.get).toHaveBeenCalledWith(`${API_URL}/auth/profile`, {
            headers: {
                Authorization: 'Bearer abc-token'
            }
        });
        expect(result).toEqual({ user: { username: 'vega' } });
    });

    it('getToken returns token from localStorage', () => {
        localStorage.setItem('token', 'saved-token');
        expect(getToken()).toBe('saved-token');
    });

});
