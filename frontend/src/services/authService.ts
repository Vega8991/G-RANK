import axios from 'axios';
import { API_URL } from '../config/api';
import type { AuthResponse, User } from '../types';

export const register = async (username: string, email: string, password: string): Promise<AuthResponse> => {
    try {
        const response = await axios.post(`${API_URL}/auth/register`, {
            username,
            email,
            password
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const login = async (email: string, password: string): Promise<AuthResponse> => {
    try {
        const response = await axios.post(`${API_URL}/auth/login`, {
            email,
            password
        });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            window.dispatchEvent(new Event('auth-change'));
        }
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const logout = (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('auth-change'));
};

export const getProfile = async (): Promise<User> => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No token found');
        }
        const response = await axios.get(`${API_URL}/auth/profile`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getToken = (): string | null => {
    return localStorage.getItem('token');
};
