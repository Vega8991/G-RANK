import axios from 'axios';
import { API_URL } from '../config/api';
import { getToken } from './authService';

export const createTournament = async (title, description) => {
    const token = getToken();
    const response = await axios.post(`${API_URL}/tournaments`, {
        name: title,
        description,
        game: 'Pokemon Showdown',
        maxParticipants: 2
    }, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
};

export const getAllTournaments = async () => {
    const response = await axios.get(`${API_URL}/tournaments`);
    return response.data;
};

export const registerToTournament = async (tournamentId) => {
    const token = getToken();
    const response = await axios.post(`${API_URL}/tournament-participants/register`, {
        tournamentId
    }, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
};

export const getMyTournaments = async () => {
    const token = getToken();
    const response = await axios.get(`${API_URL}/tournament-participants/my-tournaments`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
};
