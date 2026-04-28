import axios from 'axios';
import { API_URL } from '../config/api';
import { getToken } from './authService';
import type { User, Lobby } from '../types';

function authHeaders() {
    const token = getToken();
    if (!token) throw new Error('No token');
    return { Authorization: `Bearer ${token}` };
}

export interface AdminStats {
    totalUsers: number;
    totalLobbies: number;
    activeLobbies: number;
    suspendedUsers: number;
}

export interface CreateUserPayload {
    username: string;
    email: string;
    password: string;
    role?: 'USER' | 'ADMIN';
    rank?: string;
    mmr?: number;
    status?: string;
}

export interface UpdateUserPayload {
    username?: string;
    email?: string;
    role?: 'USER' | 'ADMIN';
    rank?: string;
    mmr?: number;
    status?: string;
    password?: string;
}

export interface UpdateLobbyPayload {
    name?: string;
    description?: string;
    game?: string;
    maxParticipants?: number;
    status?: string;
    prizePool?: string;
    registrationDeadline?: string;
    matchDateTime?: string;
}

export async function getAdminStats(): Promise<AdminStats> {
    const res = await axios.get(`${API_URL}/admin/stats`, { headers: authHeaders() });
    return res.data.stats;
}

export async function adminGetUsers(): Promise<User[]> {
    const res = await axios.get(`${API_URL}/admin/users`, { headers: authHeaders() });
    return res.data.users;
}

export async function adminCreateUser(payload: CreateUserPayload): Promise<User> {
    const res = await axios.post(`${API_URL}/admin/users`, payload, { headers: authHeaders() });
    return res.data.user;
}

export async function adminUpdateUser(id: string, payload: UpdateUserPayload): Promise<User> {
    const res = await axios.patch(`${API_URL}/admin/users/${id}`, payload, { headers: authHeaders() });
    return res.data.user;
}

export async function adminDeleteUser(id: string): Promise<void> {
    await axios.delete(`${API_URL}/admin/users/${id}`, { headers: authHeaders() });
}

export async function adminGetLobbies(): Promise<Lobby[]> {
    const res = await axios.get(`${API_URL}/admin/lobbies`, { headers: authHeaders() });
    return res.data.lobbies;
}

export async function adminUpdateLobby(id: string, payload: UpdateLobbyPayload): Promise<Lobby> {
    const res = await axios.patch(`${API_URL}/admin/lobbies/${id}`, payload, { headers: authHeaders() });
    return res.data.lobby;
}

export async function adminDeleteLobby(id: string): Promise<void> {
    await axios.delete(`${API_URL}/admin/lobbies/${id}`, { headers: authHeaders() });
}
