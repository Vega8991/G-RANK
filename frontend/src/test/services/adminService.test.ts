import apiClient from '../../services/apiClient';
import {
    getAdminStats,
    adminGetUsers,
    adminCreateUser,
    adminUpdateUser,
    adminDeleteUser,
    adminGetLobbies,
    adminUpdateLobby,
    adminDeleteLobby,
} from '../../services/adminService';

vi.mock('../../services/apiClient', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
    },
}));

describe('adminService', () => {
    const mockedApiClient = vi.mocked(apiClient);

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('getAdminStats returns stats from response', async () => {
        const stats = { totalUsers: 10, totalLobbies: 5, activeLobbies: 2, suspendedUsers: 1 };
        mockedApiClient.get.mockResolvedValueOnce({ data: { stats } });

        const result = await getAdminStats();

        expect(mockedApiClient.get).toHaveBeenCalledWith('/admin/stats');
        expect(result).toEqual(stats);
    });

    it('adminGetUsers returns users array', async () => {
        const users = [{ _id: 'u1', username: 'alice' }];
        mockedApiClient.get.mockResolvedValueOnce({ data: { users } });

        const result = await adminGetUsers();

        expect(mockedApiClient.get).toHaveBeenCalledWith('/admin/users');
        expect(result).toEqual(users);
    });

    it('adminCreateUser posts payload and returns new user', async () => {
        const payload = { username: 'bob', email: 'bob@test.com', password: 'pass123' };
        const user = { _id: 'u2', ...payload };
        mockedApiClient.post.mockResolvedValueOnce({ data: { user } });

        const result = await adminCreateUser(payload);

        expect(mockedApiClient.post).toHaveBeenCalledWith('/admin/users', payload);
        expect(result).toEqual(user);
    });

    it('adminUpdateUser patches user by id and returns updated user', async () => {
        const updated = { _id: 'u1', username: 'alice2' };
        mockedApiClient.patch.mockResolvedValueOnce({ data: { user: updated } });

        const result = await adminUpdateUser('u1', { username: 'alice2' });

        expect(mockedApiClient.patch).toHaveBeenCalledWith('/admin/users/u1', { username: 'alice2' });
        expect(result).toEqual(updated);
    });

    it('adminDeleteUser calls DELETE on user endpoint', async () => {
        mockedApiClient.delete.mockResolvedValueOnce({ data: {} });

        await adminDeleteUser('u1');

        expect(mockedApiClient.delete).toHaveBeenCalledWith('/admin/users/u1');
    });

    it('adminGetLobbies returns lobbies array', async () => {
        const lobbies = [{ _id: 'l1', name: 'Tournament 1' }];
        mockedApiClient.get.mockResolvedValueOnce({ data: { lobbies } });

        const result = await adminGetLobbies();

        expect(mockedApiClient.get).toHaveBeenCalledWith('/admin/lobbies');
        expect(result).toEqual(lobbies);
    });

    it('adminUpdateLobby patches lobby by id and returns updated lobby', async () => {
        const updated = { _id: 'l1', name: 'Updated Tournament' };
        mockedApiClient.patch.mockResolvedValueOnce({ data: { lobby: updated } });

        const result = await adminUpdateLobby('l1', { name: 'Updated Tournament' });

        expect(mockedApiClient.patch).toHaveBeenCalledWith('/admin/lobbies/l1', { name: 'Updated Tournament' });
        expect(result).toEqual(updated);
    });

    it('adminDeleteLobby calls DELETE on lobby endpoint', async () => {
        mockedApiClient.delete.mockResolvedValueOnce({ data: {} });

        await adminDeleteLobby('l1');

        expect(mockedApiClient.delete).toHaveBeenCalledWith('/admin/lobbies/l1');
    });

    it('getAdminStats throws when request fails', async () => {
        mockedApiClient.get.mockRejectedValueOnce(new Error('Network error'));

        await expect(getAdminStats()).rejects.toThrow('Network error');
    });
});
