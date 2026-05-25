import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Admin from '../../pages/Admin';

vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, className, layoutId }: { children: React.ReactNode; className?: string; layoutId?: string }) => (
            <div className={className} data-layoutid={layoutId}>{children}</div>
        ),
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../../components/admin/AdminBackground', () => ({
    default: () => <div data-testid="admin-background" />,
}));

const mockHandleSaveUser   = vi.fn();
const mockHandleDeleteUser = vi.fn();
const mockHandleSaveLobby  = vi.fn();
const mockHandleDeleteLobby = vi.fn();
const mockHandleRefresh    = vi.fn();
const mockSetToast         = vi.fn();

const mockAdminUser = {
    _id: 'admin-1', username: 'AdminUser', email: 'admin@test.com',
    role: 'ADMIN' as const, status: 'active' as const, mmr: 0, rank: 'Elite', updatedAt: '',
};

const mockLobby = {
    _id: 'lobby-1', name: 'Epic Cup', description: 'Tournament desc', game: 'pokemon_showdown',
    maxParticipants: 8, currentParticipants: 2, registrationDeadline: '', matchDateTime: '',
    status: 'open' as const, createdBy: 'admin-1', prizePool: '$50', createdAt: '2024-01-01T00:00:00Z', updatedAt: '',
};

const mockStats = { totalUsers: 10, totalLobbies: 4, activeLobbies: 2, suspendedUsers: 1 };

const defaultHook = {
    currentUser: mockAdminUser,
    stats: mockStats,
    users: [mockAdminUser],
    lobbies: [mockLobby],
    loading: false,
    toast: null,
    setToast: mockSetToast,
    handleSaveUser: mockHandleSaveUser,
    handleDeleteUser: mockHandleDeleteUser,
    handleSaveLobby: mockHandleSaveLobby,
    handleDeleteLobby: mockHandleDeleteLobby,
    handleRefresh: mockHandleRefresh,
    loadAll: vi.fn(),
};

vi.mock('../../hooks/useAdmin', () => ({
    useAdmin: vi.fn(() => defaultHook),
}));

import { useAdmin } from '../../hooks/useAdmin';
const mockedUseAdmin = vi.mocked(useAdmin);

describe('Admin page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockedUseAdmin.mockReturnValue(defaultHook);
    });

    it('renders "Control Center" heading', () => {
        render(<Admin />);
        expect(screen.getByText('Control Center')).toBeInTheDocument();
    });

    it('shows current user name', () => {
        render(<Admin />);
        // AdminUser appears in header and in UsersTable row
        const matches = screen.getAllByText('AdminUser');
        expect(matches.length).toBeGreaterThanOrEqual(1);
    });

    it('shows stat cards', () => {
        render(<Admin />);
        expect(screen.getByText('Total Users')).toBeInTheDocument();
        // "Tournaments" appears as tab label and as stat card label — use getAllByText
        const tournamentTexts = screen.getAllByText('Tournaments');
        expect(tournamentTexts.length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText('Active Now')).toBeInTheDocument();
        expect(screen.getByText('Suspended')).toBeInTheDocument();
    });

    it('renders Users tab by default', () => {
        render(<Admin />);
        expect(screen.getByPlaceholderText('Search users...')).toBeInTheDocument();
    });

    it('switches to Lobbies tab on click', async () => {
        const user = userEvent.setup();
        render(<Admin />);

        await user.click(screen.getByRole('button', { name: /tournaments/i }));

        expect(screen.getByPlaceholderText('Search tournaments...')).toBeInTheDocument();
    });

    it('switches back to Users tab', async () => {
        const user = userEvent.setup();
        render(<Admin />);

        await user.click(screen.getByRole('button', { name: /tournaments/i }));
        await user.click(screen.getByRole('button', { name: /users/i }));

        expect(screen.getByPlaceholderText('Search users...')).toBeInTheDocument();
    });

    it('shows loading spinner when loading is true', () => {
        mockedUseAdmin.mockReturnValue({ ...defaultHook, loading: true });
        render(<Admin />);
        expect(screen.getByText('Loading admin panel...')).toBeInTheDocument();
    });

    it('does not show stat cards when stats is null', () => {
        mockedUseAdmin.mockReturnValue({ ...defaultHook, stats: null });
        render(<Admin />);
        expect(screen.queryByText('Total Users')).not.toBeInTheDocument();
    });

    it('opens UserModal when Create User button clicked', async () => {
        const user = userEvent.setup();
        render(<Admin />);

        await user.click(screen.getByRole('button', { name: /create.*user/i }));

        // After modal opens, "Add a new platform user" is unique to UserModal
        expect(screen.getByText('Add a new platform user')).toBeInTheDocument();
    });

    it('opens UserModal in edit mode when edit button clicked in UsersTable', async () => {
        const user = userEvent.setup();
        render(<Admin />);

        // Find edit button (pencil icon) in the users table
        const editBtns = screen.getAllByRole('button').filter(btn =>
            btn.className.includes('rounded-lg') && btn.querySelector('svg') &&
            btn.className.includes('bg-white/10')
        );
        await user.click(editBtns[0]);

        expect(screen.getByText('Edit User')).toBeInTheDocument();
        expect(screen.getByText('Editing AdminUser')).toBeInTheDocument();
    });

    it('opens ConfirmDialog when delete button clicked in UsersTable', async () => {
        const user = userEvent.setup();
        render(<Admin />);

        const deleteBtns = screen.getAllByRole('button').filter(btn =>
            btn.className.includes('rounded-lg') && btn.querySelector('svg') &&
            btn.className.includes('bg-white/10')
        );
        await user.click(deleteBtns[1]);

        expect(screen.getByText(/Delete user.*AdminUser/)).toBeInTheDocument();
    });

    it('calls handleRefresh when Refresh button clicked', async () => {
        const user = userEvent.setup();
        mockHandleRefresh.mockResolvedValue(undefined);
        render(<Admin />);

        await user.click(screen.getByRole('button', { name: /refresh/i }));

        await waitFor(() => {
            expect(mockHandleRefresh).toHaveBeenCalled();
        });
    });

    it('closes UserModal on cancel', async () => {
        const user = userEvent.setup();
        render(<Admin />);

        await user.click(screen.getByRole('button', { name: /create.*user/i }));
        expect(screen.getByText('Add a new platform user')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: /cancel/i }));
        expect(screen.queryByText('Add a new platform user')).not.toBeInTheDocument();
    });

    it('opens LobbyModal when edit button clicked on Lobbies tab', async () => {
        const user = userEvent.setup();
        render(<Admin />);

        await user.click(screen.getByRole('button', { name: /tournaments/i }));

        const editBtns = screen.getAllByRole('button').filter(btn =>
            btn.className.includes('rounded-lg') && btn.querySelector('svg') &&
            btn.className.includes('bg-white/10')
        );
        await user.click(editBtns[0]);

        expect(screen.getByText('Edit Tournament')).toBeInTheDocument();
    });

    it('shows AdminToast when toast is set', () => {
        mockedUseAdmin.mockReturnValue({
            ...defaultHook,
            toast: { message: 'User created', ok: true },
        });
        render(<Admin />);
        expect(screen.getByText('User created')).toBeInTheDocument();
    });
});
