import apiClient from './apiClient';
import { AUTH_CHANGE_EVENT } from '../constants/events';
import type { AuthResponse, User } from '../types';

export interface NavInfo {
    username: string;
    role: 'USER' | 'ADMIN';
}

interface JwtPayload {
    username: string;
    role: string;
    exp: number;
}

// Read the data stored inside a JWT token without verifying its signature.
// A JWT has three parts separated by dots: "header.payload.signature"
// We only read the middle part (payload), which contains the username, role, and expiry date.
// Security note: the REAL security check happens on the backend — it verifies the signature.
// Here we just read the data so the UI knows whether to show the login button or the username.
function decodeToken(token: string): JwtPayload | null {
    try {
        // Split "header.payload.signature" and take the middle part
        const payloadBase64 = token.split('.')[1];

        // atob() decodes a Base64 string back to plain text
        const payloadJson = atob(payloadBase64);
        const payload = JSON.parse(payloadJson) as JwtPayload;

        if (!payload.username || !payload.role || !payload.exp) return null;

        // Check if token has expired (exp is in seconds, Date.now() is in milliseconds)
        const nowInSeconds = Date.now() / 1000;
        if (nowInSeconds > payload.exp) {
            localStorage.removeItem('token');
            return null;
        }

        return payload;
    } catch {
        // If anything goes wrong (malformed token, etc.), treat it as invalid
        return null;
    }
}

// Get the username and role from the stored JWT. Returns null if not logged in or token expired.
export function getNavInfo(): NavInfo | null {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const payload = decodeToken(token);
    if (!payload) return null;

    return {
        username: payload.username,
        role: payload.role as 'USER' | 'ADMIN',
    };
}

// Returns true if there is a valid, non-expired token in localStorage.
export function isTokenValid(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;
    return decodeToken(token) !== null;
}

export const register = async (username: string, email: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/register', { username, email, password });
    return response.data as AuthResponse;
};

export const login = async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', { email, password });
    const data = response.data as AuthResponse;
    if (data.token) {
        localStorage.setItem('token', data.token);
        window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
    }
    return data;
};

export const logout = (): void => {
    localStorage.removeItem('token');
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
};

export const getProfile = async (): Promise<{ user: User }> => {
    const response = await apiClient.get('/auth/profile');
    return response.data as { user: User };
};

export const getPublicProfile = async (username: string): Promise<{ user: User }> => {
    const response = await apiClient.get(`/auth/users/${username}`);
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

export const getToken = (): string | null => {
    return localStorage.getItem('token');
};
