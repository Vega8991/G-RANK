import apiClient from './apiClient';
import type {
    RiotAccount,
    RiotFullProfile,
    RiotMatchResultResponse,
    RiotPlatform,
} from '../types';

export async function linkRiotAccount(
    gameName: string,
    tagLine: string,
    platform: RiotPlatform
): Promise<{ success: boolean; message: string; riotAccount: RiotAccount }> {
    const res = await apiClient.post('/riot/link', { gameName, tagLine, platform });
    return res.data as { success: boolean; message: string; riotAccount: RiotAccount };
}

export async function unlinkRiotAccount(): Promise<{ success: boolean; message: string }> {
    const res = await apiClient.delete('/riot/unlink');
    return res.data as { success: boolean; message: string };
}

export async function getMyRiotProfile(): Promise<{ success: boolean; profile: RiotFullProfile }> {
    const res = await apiClient.get('/riot/profile');
    return res.data as { success: boolean; profile: RiotFullProfile };
}

export async function getRiotProfileByRiotId(
    riotId: string,
    platform: RiotPlatform = 'na1'
): Promise<{ success: boolean; profile: RiotFullProfile }> {
    const res = await apiClient.get(`/riot/profile/${encodeURIComponent(riotId)}`, {
        params: { platform },
    });
    return res.data as { success: boolean; profile: RiotFullProfile };
}

export async function submitLolMatch(
    lobbyId: string,
    matchId: string
): Promise<RiotMatchResultResponse> {
    const res = await apiClient.post('/riot/submit-lol-match', { lobbyId, matchId });
    return res.data as RiotMatchResultResponse;
}

export async function getRiotOAuthUrl(
    platform: RiotPlatform
): Promise<{ success: boolean; url: string }> {
    const res = await apiClient.get('/riot/oauth/url', { params: { platform } });
    return res.data as { success: boolean; url: string };
}
