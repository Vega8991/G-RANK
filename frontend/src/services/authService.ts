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

function getAuthInfoCookie(): AuthInfo | null {
    try {
        const match = document.cookie.split('; ').find(c => c.startsWith('auth_info='));
        if (!match) return null;
        const raw = decodeURIComponent(match.slice('auth_info='.length));
        const info = JSON.parse(raw) as AuthInfo;
        if (!info.username || !info.role || !info.exp) return null;
        if (Date.now() / 1000 > info.exp) return null;
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
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
    return response.data as AuthResponse;
};

export const logout = async (): Promise<void> => {
    await apiClient.post('/auth/logout');
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

