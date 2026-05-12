import axios from 'axios';
import { API_URL } from '../config/api';
import { AUTH_CHANGE_EVENT } from '../constants/events';

const apiClient = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
        }
        return Promise.reject(error);
    }
);

export default apiClient;
