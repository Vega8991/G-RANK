import axios from 'axios';
import { API_URL } from '../config/api';
import type { AuthResponse, User } from '../types';

export interface NavInfo {
    username: string;
    role: 'USER' | 'ADMIN';
}

export function getNavInfo(): NavInfo | null {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (!payload.username || !payload.role) return null;
        return { username: payload.username, role: payload.role };
    } catch {
        return null;
    }
}

export const register = async (username: string, email: string, password: string): Promise<AuthResponse> => {
    const response = await axios.post(`${API_URL}/auth/register`, { username, email, password });
    return response.data;
};

export const login = async (email: string, password: string): Promise<AuthResponse> => {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        window.dispatchEvent(new Event('auth-change'));
    }
    return response.data;
};

export const logout = (): void => {
    localStorage.removeItem('token');
    window.dispatchEvent(new Event('auth-change'));
};

export const getProfile = async (): Promise<{ user: User }> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token found');
    const response = await axios.get(`${API_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const getPublicProfile = async (username: string): Promise<{ user: User }> => {
    const response = await axios.get(`${API_URL}/auth/users/${username}`);
    return response.data;
};

export const forgotPassword = async (email: string): Promise<{ message: string }> => {
    const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
    return response.data;
};

export const resetPassword = async (token: string, password: string): Promise<{ message: string }> => {
    const response = await axios.post(`${API_URL}/auth/reset-password`, { token, password });
    return response.data;
};

export const getToken = (): string | null => {
    return localStorage.getItem('token');
};
