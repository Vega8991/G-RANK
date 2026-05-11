import apiClient from './apiClient';
import type { MatchResultResponse } from '../types';

export const submitReplay = async (lobbyId: string, replayUrl: string): Promise<MatchResultResponse> => {
    const response = await apiClient.post('/match-results/submit-replay', { lobbyId, replayUrl });
    return response.data as MatchResultResponse;
};
