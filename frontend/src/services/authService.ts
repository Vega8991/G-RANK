import apiClient from './apiClient';
import { AUTH_CHANGE_EVENT } from '../constants/events';
import type { AuthResponse, User } from '../types';

export interface NavInfo {
    username: string;
    role: 'USER' | 'ADMIN';
}

interface AuthInfo {
    username: string;
    role: string;
    exp: number;
}

const AUTH_STORAGE_KEY = 'g_auth';

function saveAuthInfo(info: AuthInfo): void {
    try { localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(info)); } catch {}
}

function clearAuthInfo(): void {
    try { localStorage.removeItem(AUTH_STORAGE_KEY); } catch {}
}

function getAuthInfoCookie(): AuthInfo | null {
    // Try cookie first (works same-domain / local dev)
    try {
        const match = document.cookie.split(';').find(c => c.trim().startsWith('auth_info='));
        if (match) {
            const raw = decodeURIComponent(match.trim().slice('auth_info='.length));
            const info = JSON.parse(raw) as AuthInfo;
            if (info.username && info.role && info.exp && Date.now() / 1000 <= info.exp) return info;
        }
    } catch {}

    // Fallback: localStorage (needed cross-domain in production)
    try {
        const raw = localStorage.getItem(AUTH_STORAGE_KEY);
        if (!raw) return null;
        const info = JSON.parse(raw) as AuthInfo;
        if (!info.username || !info.role || !info.exp) return null;
        if (Date.now() / 1000 > info.exp) { clearAuthInfo(); return null; }
        return info;
    } catch {
        return null;
    }
}

export function getNavInfo(): NavInfo | null {
    const info = getAuthInfoCookie();
    if (!info) return null;
    return { username: info.username, role: info.role as 'USER' | 'ADMIN' };
}

export function isTokenValid(): boolean {
    return getAuthInfoCookie() !== null;
}

export const register = async (username: string, email: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/register', { username, email, password });
    return response.data as AuthResponse;
};

export const login = async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', { email, password });
    const data = response.data as AuthResponse & { user?: AuthInfo };
    if (data.user) saveAuthInfo(data.user);
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
    return response.data as AuthResponse;
};

export const logout = async (): Promise<void> => {
    await apiClient.post('/auth/logout');
    clearAuthInfo();
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
};

export const getProfile = async (): Promise<{ user: User }> => {
    const response = await apiClient.get('/auth/profile');
    return response.data as { user: User };
};

export const resendVerification = async (email: string): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/resend-verification', { email });
    return response.data as { message: string };
};

export const forgotPassword = async (email: string): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data as { message: string };
};

export const resetPassword = async (token: string, password: string): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/reset-password', { token, password });
    return response.data as { message: string };
};

