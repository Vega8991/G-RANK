import axios from 'axios';
import { API_URL } from '../config/api';
import { getToken } from './authService';

export const submitReplay = async(tournamentId, replayUrl) => {
    const token = getToken();
    const response = await axios.post(`${API_URL}/match-results/submit-replay`, {
        tournamentId,
        replayUrl
    }, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
};