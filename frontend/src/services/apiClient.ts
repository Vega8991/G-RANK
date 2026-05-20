import axios from 'axios';
import { API_URL } from '../config/api';
import { AUTH_CHANGE_EVENT } from '../constants/events';

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

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config;

        if (error.response?.status !== 401) {
            return Promise.reject(error);
        }

        // No config (e.g. network error, cancelled request) — treat as terminal auth failure
        if (!original) {
            window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
            return Promise.reject(error);
        }

        if (original._retry) {
            return Promise.reject(error);
        }

        // Don't retry the refresh endpoint itself
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
            await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
            drainQueue();
            return apiClient(original);
        } catch (refreshError) {
            drainQueue(refreshError);
            window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

export default apiClient;
