import apiClient from './apiClient';
import type { User, Lobby } from '../types';

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
    const res = await apiClient.get('/admin/stats');
    return (res.data as { stats: AdminStats }).stats;
}

export async function adminGetUsers(): Promise<User[]> {
    const res = await apiClient.get('/admin/users');
    return (res.data as { users: User[] }).users;
}

export async function adminCreateUser(payload: CreateUserPayload): Promise<User> {
    const res = await apiClient.post('/admin/users', payload);
    return (res.data as { user: User }).user;
}

export async function adminUpdateUser(id: string, payload: UpdateUserPayload): Promise<User> {
    const res = await apiClient.patch(`/admin/users/${id}`, payload);
    return (res.data as { user: User }).user;
}

export async function adminDeleteUser(id: string): Promise<void> {
    await apiClient.delete(`/admin/users/${id}`);
}

export async function adminGetLobbies(): Promise<Lobby[]> {
    const res = await apiClient.get('/admin/lobbies');
    return (res.data as { lobbies: Lobby[] }).lobbies;
}

export async function adminUpdateLobby(id: string, payload: UpdateLobbyPayload): Promise<Lobby> {
    const res = await apiClient.patch(`/admin/lobbies/${id}`, payload);
    return (res.data as { lobby: Lobby }).lobby;
}

export async function adminDeleteLobby(id: string): Promise<void> {
    await apiClient.delete(`/admin/lobbies/${id}`);
}
