import axios from 'axios';
import { API_URL } from '../config/api';
import { getToken } from './authService';
import type { MatchResultResponse } from '../types';

export const submitReplay = async (lobbyId: string, replayUrl: string): Promise<MatchResultResponse> => {
    try {
        const token = getToken();
        if (!token) {
            throw new Error('No authentication token found');
        }
        const response = await axios.post(`${API_URL}/match-results/submit-replay`, {
            lobbyId,
            replayUrl
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
