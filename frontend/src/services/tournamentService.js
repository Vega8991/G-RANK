import axios from 'axios';
import { API_URL } from '../config/api';
import { getToken } from './authService';

export const createTournament = async (title, description, registrationDeadline, matchDateTime) => {
    try {
        const token = getToken();
        if (!token) {
            throw new Error('No authentication token found');
        }
        const response = await axios.post(`${API_URL}/tournaments`, {
            name: title,
            description,
            game: 'pokemon_showdown',
            maxParticipants: 2,
            registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : new Date(Date.now() + 24 * 60 * 60 * 1000),
            matchDateTime: matchDateTime ? new Date(matchDateTime) : new Date(Date.now() + 48 * 60 * 60 * 1000)
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getAllTournaments = async () => {
    try {
        const response = await axios.get(`${API_URL}/tournaments`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const registerToTournament = async (tournamentId) => {
    try {
        const token = getToken();
        if (!token) {
            throw new Error('No authentication token found');
        }
        const response = await axios.post(`${API_URL}/tournament-participants/register`, {
            tournamentId
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getMyTournaments = async () => {
    try {
        const token = getToken();
        if (!token) {
            throw new Error('No authentication token found');
        }
        const response = await axios.get(`${API_URL}/tournament-participants/my-tournaments`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};
