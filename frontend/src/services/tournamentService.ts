import axios from 'axios';
import { API_URL } from '../config/api';
import { getToken } from './authService';
import type { Tournament } from '../types';

function requireToken(): string {
    const token = getToken();
    if (!token) {
        throw new Error('No authentication token found');
    }
    return token;
}

function getAuthHeaders(token: string) {
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
}

export const createTournament = async (
    title: string,
    description: string,
    registrationDeadline?: string,
    matchDateTime?: string
): Promise<{ tournament: Tournament }> => {
    const token = requireToken();

    const deadlineDate = registrationDeadline ? new Date(registrationDeadline) : new Date(Date.now() + 24 * 60 * 60 * 1000);
    const matchDate = matchDateTime ? new Date(matchDateTime) : new Date(Date.now() + 48 * 60 * 60 * 1000);

    const response = await axios.post(`${API_URL}/tournaments`, {
        name: title,
        description,
        game: 'pokemon_showdown',
        maxParticipants: 2,
        registrationDeadline: deadlineDate,
        matchDateTime: matchDate
    }, getAuthHeaders(token));

    return response.data;
};

export const getAllTournaments = async (): Promise<{ tournaments: Tournament[] }> => {
    const response = await axios.get(`${API_URL}/tournaments`);
    return response.data;
};

export const registerToTournament = async (tournamentId: string): Promise<{ message: string }> => {
    const token = requireToken();

    const response = await axios.post(`${API_URL}/tournament-participants/register`, {
        tournamentId
    }, getAuthHeaders(token));

    return response.data;
};

export const getMyTournaments = async (): Promise<{ tournaments: Tournament[] }> => {
    const token = requireToken();

    const response = await axios.get(`${API_URL}/tournament-participants/my-tournaments`, getAuthHeaders(token));

    return response.data;
};

export const syncParticipantCounts = async (): Promise<{ message: string }> => {
    const response = await axios.post(`${API_URL}/tournaments/sync-counts`);
    return response.data;
};
