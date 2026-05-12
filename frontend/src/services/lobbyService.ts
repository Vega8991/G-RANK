import apiClient from './apiClient';
import type { Lobby } from '../types';

export const createLobby = async (
    name: string,
    description: string,
    maxParticipants: number,
    prizePool: string,
    registrationDeadline?: string,
    matchDateTime?: string,
    game: string = 'pokemon_showdown'
): Promise<{ lobby: Lobby }> => {
    const deadlineDate = registrationDeadline
        ? new Date(registrationDeadline)
        : new Date(Date.now() + 24 * 60 * 60 * 1000);

    const matchDate = matchDateTime
        ? new Date(matchDateTime)
        : new Date(Date.now() + 48 * 60 * 60 * 1000);

    const response = await apiClient.post('/lobbies', {
        name: name,
        description: description,
        game: game,
        maxParticipants: maxParticipants,
        prizePool: prizePool,
        registrationDeadline: deadlineDate,
        matchDateTime: matchDate
    });

    return response.data as { lobby: Lobby };
};

export const getAllLobbies = async (): Promise<{ lobbies: Lobby[] }> => {
    const response = await apiClient.get('/lobbies');
    return response.data as { lobbies: Lobby[] };
};

export const registerToLobby = async (lobbyId: string): Promise<{ message: string }> => {
    const response = await apiClient.post('/lobby-participants/register', { lobbyId: lobbyId });
    return response.data as { message: string };
};

export const leaveLobby = async (lobbyId: string): Promise<{ message: string }> => {
    const response = await apiClient.post('/lobby-participants/leave', { lobbyId: lobbyId });
    return response.data as { message: string };
};

export const getMyLobbies = async (): Promise<{ lobbies: Lobby[] }> => {
    const response = await apiClient.get('/lobby-participants/my-lobbies');
    return response.data as { lobbies: Lobby[] };
};

export const syncParticipantCounts = async (): Promise<{ message: string }> => {
    const response = await apiClient.post('/lobbies/sync-counts');
    return response.data as { message: string };
};
