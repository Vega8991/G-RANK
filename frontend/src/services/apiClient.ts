import axios from 'axios';
import { API_URL } from '../config/api';
import { AUTH_CHANGE_EVENT } from '../constants/events';
import { getAccessToken, getRefreshToken, saveTokens, clearAuthInfo, clearTokens } from './tokenStorage';

const apiClient = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

let isRefreshing = false;
let pendingQueue: Array<{ resolve: () => void; reject: (e: unknown) => void }> = [];

function drainQueue(error?: unknown) {
    pendingQueue.forEach(p => (error ? p.reject(error) : p.resolve()));
    pendingQueue = [];
}

// Attach access token from localStorage as Bearer header
apiClient.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config;

        if (error.response?.status !== 401) {
            return Promise.reject(error);
        }

        if (!original) {
            window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
            return Promise.reject(error);
        }

        if (original._retry) {
            return Promise.reject(error);
        }

        if (original.url?.includes('/auth/refresh') || original.url?.includes('/auth/login')) {
            window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
            return Promise.reject(error);
        }

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                pendingQueue.push({
                    resolve: () => resolve(apiClient(original)),
                    reject,
                });
            });
        }

        original._retry = true;
        isRefreshing = true;

        try {
            const refreshToken = getRefreshToken();
            const resp = await axios.post(
                `${API_URL}/auth/refresh`,
                refreshToken ? { refreshToken } : {},
                { withCredentials: true }
            );
            const newAccessToken: string | undefined = resp.data?.accessToken;
            if (newAccessToken) saveTokens(newAccessToken);
            drainQueue();
            return apiClient(original);
        } catch (refreshError) {
            drainQueue(refreshError);
            clearAuthInfo();
            clearTokens();
            window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

export default apiClient;
