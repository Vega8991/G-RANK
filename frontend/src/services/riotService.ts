import axios from 'axios';
import { API_URL } from '../config/api';
import { getToken } from './authService';
import type {
    RiotAccount,
    RiotFullProfile,
    RiotMatchResultResponse,
    RiotPlatform,
    ValPlatform
} from '../types';

function authHeaders() {
    const token = getToken();
    if (!token) throw new Error('No authentication token found');
    return { Authorization: `Bearer ${token}` };
}

export async function linkRiotAccount(
    gameName: string,
    tagLine: string,
    platform: RiotPlatform
): Promise<{ success: boolean; message: string; riotAccount: RiotAccount }> {
    const res = await axios.post(
        `${API_URL}/riot/link`,
        { gameName, tagLine, platform },
        { headers: authHeaders() }
    );
    return res.data;
}

export async function unlinkRiotAccount(): Promise<{ success: boolean; message: string }> {
    const res = await axios.delete(`${API_URL}/riot/unlink`, {
        headers: authHeaders()
    });
    return res.data;
}

export async function getMyRiotProfile(): Promise<{ success: boolean; profile: RiotFullProfile }> {
    const res = await axios.get(`${API_URL}/riot/profile`, {
        headers: authHeaders()
    });
    return res.data;
}

export async function getRiotProfileByRiotId(
    riotId: string,
    platform: RiotPlatform = 'na1'
): Promise<{ success: boolean; profile: RiotFullProfile }> {
    const res = await axios.get(`${API_URL}/riot/profile/${encodeURIComponent(riotId)}`, {
        params: { platform }
    });
    return res.data;
}

export async function submitLolMatch(
    lobbyId: string,
    matchId: string
): Promise<RiotMatchResultResponse> {
    const res = await axios.post(
        `${API_URL}/riot/submit-lol-match`,
        { lobbyId, matchId },
        { headers: authHeaders() }
    );
    return res.data;
}

export async function getRiotOAuthUrl(
    platform: RiotPlatform
): Promise<{ success: boolean; url: string }> {
    const res = await axios.get(`${API_URL}/riot/oauth/url`, {
        params: { platform },
        headers: authHeaders()
    });
    return res.data;
}
