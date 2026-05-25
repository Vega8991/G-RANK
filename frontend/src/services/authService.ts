import apiClient from './apiClient';
import { AUTH_CHANGE_EVENT } from '../constants/events';
import type { AuthResponse, User } from '../types';
import {
    getAuthInfo,
    saveAuthInfo,
    clearAuthInfo,
    saveTokens,
    clearTokens,
    type AuthInfo,
} from './tokenStorage';

export interface NavInfo {
    username: string;
    role: 'USER' | 'ADMIN';
}

export function getNavInfo(): NavInfo | null {
    const info = getAuthInfo();
    if (!info) return null;
    return { username: info.username, role: info.role as 'USER' | 'ADMIN' };
}

export function isTokenValid(): boolean {
    return getAuthInfo() !== null;
}

export const register = async (username: string, email: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/register', { username, email, password });
    return response.data as AuthResponse;
};

export const login = async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', { email, password });
    const data = response.data as AuthResponse & { user?: AuthInfo; accessToken?: string; refreshToken?: string };
    if (data.user) saveAuthInfo(data.user);
    if (data.accessToken) saveTokens(data.accessToken, data.refreshToken);
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
    return response.data as AuthResponse;
};

export const logout = async (): Promise<void> => {
    await apiClient.post('/auth/logout');
    clearAuthInfo();
    clearTokens();
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
