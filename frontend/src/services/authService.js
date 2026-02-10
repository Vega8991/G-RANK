import axios from 'axios';
import { API_URL } from '../config/api';

export const register = async (username, email, password) => {
    const response = await axios.post(`${API_URL}/auth/register`, {
        username,
        email,
        password
    });
    return response.data;
};

export const login = async (email, password) => {
    const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
    });
    if(response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

export const getProfile = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/auth/profile`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
};

export const isAuthenticated = () => {
    return localStorage.getItem('token') !== null;
};

export const getToken = () => {
    return localStorage.getItem('token');
};