import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Dashboard from '../../pages/Dashboard';
import { useDashboard } from '../../hooks/useDashboard';
import type { User } from '../../types';

vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, className }: { children: React.ReactNode; className?: string }) => (
            <div className={className}>{children}</div>
        ),
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../../hooks/useDashboard', () => ({
    useDashboard: vi.fn(),
}));

vi.mock('../../components/dashboard/DashboardBackground', () => ({ default: () => null }));
vi.mock('../../components/dashboard/StatCard',           () => ({ default: () => null }));
vi.mock('../../components/dashboard/MmrProgressCard',    () => ({ default: () => null }));
vi.mock('../../components/dashboard/RiotAccountCard',    () => ({ default: () => null }));
vi.mock('../../components/dashboard/RecentLobbiesCard',  () => ({ default: () => null }));
vi.mock('../../components/dashboard/DashboardFooter',    () => ({ default: () => null }));

const mockUser: User = {
    _id: 'u1',
    username: 'vega',
    email: 'vega@test.com',
    role: 'USER',
    mmr: 1500,
    rank: 'Gold',
    wins: 20,
    losses: 10,
    winRate: 66.7,
    winStreak: 3,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
};

function mockHook(overrides: Partial<ReturnType<typeof useDashboard>> = {}) {
    vi.mocked(useDashboard).mockReturnValue({
        user: null,
        lobbies: [],
        loadError: false,
        oauthMsg: null,
        setOauthMsg: vi.fn(),
        loadProfile: vi.fn(),
        handleLogout: vi.fn(),
        ...overrides,
    });
}

function renderPage() {
    return render(
        <MemoryRouter initialEntries={['/dashboard']}>
            <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/login" element={<p>Login page</p>} />
            </Routes>
        </MemoryRouter>
    );
}

describe('Dashboard page', () => {
    it('shows a loading spinner while the profile is loading', () => {
        mockHook({ user: null, loadError: false });
        renderPage();
        expect(screen.getByText(/loading profile/i)).toBeInTheDocument();
    });

    it('shows an error message and retry button when loading fails', () => {
        mockHook({ user: null, loadError: true });
        renderPage();
        expect(screen.getByText('Failed to load profile')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    it('calls loadProfile when the retry button is clicked', async () => {
        const user = userEvent.setup();
        const loadProfile = vi.fn().mockResolvedValue(undefined);
        mockHook({ user: null, loadError: true, loadProfile });

        renderPage();

        await user.click(screen.getByRole('button', { name: /retry/i }));
        expect(loadProfile).toHaveBeenCalled();
    });

    it('shows the username when the profile is loaded', () => {
        mockHook({ user: mockUser });
        renderPage();
        expect(screen.getByText('vega')).toBeInTheDocument();
    });

    it('shows the MMR value when the profile is loaded', () => {
        mockHook({ user: mockUser });
        renderPage();
        expect(screen.getByText(/1[,.]?500/)).toBeInTheDocument();
    });

    it('shows the rank when the profile is loaded', () => {
        mockHook({ user: mockUser });
        renderPage();
        expect(screen.getByText('Gold')).toBeInTheDocument();
    });

    it('calls handleLogout when the sign out button is clicked', async () => {
        const user = userEvent.setup();
        const handleLogout = vi.fn();
        mockHook({ user: mockUser, handleLogout });

        renderPage();

        await user.click(screen.getByRole('button', { name: /sign out/i }));
        expect(handleLogout).toHaveBeenCalled();
    });
});
