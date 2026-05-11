import axios from 'axios';
import { API_URL } from '../config/api';
import { AUTH_CHANGE_EVENT } from '../constants/events';

const apiClient = axios.create({
    baseURL: API_URL,
});

// Attach the JWT token to every request automatically
apiClient.interceptors.request.use(function (config) {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// If the server rejects the token (401), clear the stored token and trigger a logout
apiClient.interceptors.response.use(
    function (response) {
        return response;
    },
    function (error) {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
        }
        return Promise.reject(error);
    }
);

export default apiClient;
