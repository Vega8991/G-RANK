import axios from 'axios';
import { API_URL } from '../config/api';
import { getToken } from './authService';
import type { RiotPlatform, ValPlatform, RiotFullProfile, RiotMatchResultResponse } from '../types';

function requireToken(): string {
    const token = getToken();
    if (!token) throw new Error('No authentication token found');
    return token;
}

function authHeaders(token: string) {
    return { headers: { Authorization: `Bearer ${token}` } };
}

export async function linkRiotAccount(
    gameName: string,
    tagLine: string,
    platform: RiotPlatform
): Promise<{ message: string }> {
    const token = requireToken();
    const response = await axios.post(
        `${API_URL}/riot/link`,
        { gameName, tagLine, platform },
        authHeaders(token)
    );
    return response.data;
}

export async function unlinkRiotAccount(): Promise<{ message: string }> {
    const token = requireToken();
    const response = await axios.delete(`${API_URL}/riot/unlink`, authHeaders(token));
    return response.data;
}

export async function getMyRiotProfile(): Promise<{ profile: RiotFullProfile }> {
    const token = requireToken();
    const response = await axios.get(`${API_URL}/riot/profile`, authHeaders(token));
    return response.data;
}

export async function submitLolMatch(
    lobbyId: string,
    matchId: string
): Promise<RiotMatchResultResponse> {
    const token = requireToken();
    const response = await axios.post(
        `${API_URL}/riot/submit-lol-match`,
        { lobbyId, matchId },
        authHeaders(token)
    );
    return response.data;
}

export async function submitValorantMatch(
    lobbyId: string,
    matchId: string,
    platform?: ValPlatform
): Promise<RiotMatchResultResponse> {
    const token = requireToken();
    const response = await axios.post(
        `${API_URL}/riot/submit-valorant-match`,
        { lobbyId, matchId, platform },
        authHeaders(token)
    );
    return response.data;
}
