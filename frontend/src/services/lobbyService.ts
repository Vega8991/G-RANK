import axios from 'axios';
import { API_URL } from '../config/api';
import { getToken } from './authService';
import type { Lobby } from '../types';

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

export const createLobby = async (
    title: string,
    description: string,
    registrationDeadline?: string,
    matchDateTime?: string
): Promise<{ lobby: Lobby }> => {
    const token = requireToken();

    const deadlineDate = registrationDeadline ? new Date(registrationDeadline) : new Date(Date.now() + 24 * 60 * 60 * 1000);
    const matchDate = matchDateTime ? new Date(matchDateTime) : new Date(Date.now() + 48 * 60 * 60 * 1000);

    const response = await axios.post(`${API_URL}/lobbies`, {
        name: title,
        description,
        game: 'pokemon_showdown',
        maxParticipants: 2,
        registrationDeadline: deadlineDate,
        matchDateTime: matchDate
    }, getAuthHeaders(token));

    return response.data;
};

export const getAllLobbies = async (): Promise<{ lobbies: Lobby[] }> => {
    const response = await axios.get(`${API_URL}/lobbies`);
    return response.data;
};

export const registerToLobby = async (lobbyId: string): Promise<{ message: string }> => {
    const token = requireToken();

    const response = await axios.post(`${API_URL}/lobby-participants/register`, {
        lobbyId
    }, getAuthHeaders(token));

    return response.data;
};

export const getMyLobbies = async (): Promise<{ lobbies: Lobby[] }> => {
    const token = requireToken();

    const response = await axios.get(`${API_URL}/lobby-participants/my-lobbies`, getAuthHeaders(token));

    return response.data;
};

export const syncParticipantCounts = async (): Promise<{ message: string }> => {
    const response = await axios.post(`${API_URL}/lobbies/sync-counts`);
    return response.data;
};
