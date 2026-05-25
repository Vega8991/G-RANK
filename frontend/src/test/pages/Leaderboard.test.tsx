import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Leaderboard from '../../pages/Leaderboard';
import { getLeaderboard } from '../../services/leaderboardService';

vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, className }: { children: React.ReactNode; className?: string }) => (
            <div className={className}>{children}</div>
        ),
        tr: ({ children, className }: { children: React.ReactNode; className?: string }) => (
            <tr className={className}>{children}</tr>
        ),
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../../components/ui/Silk', () => ({
    default: function SilkMock() {
        return <div data-testid="silk-bg" />;
    },
}));

vi.mock('../../services/leaderboardService', () => ({
    getLeaderboard: vi.fn(),
}));

const mockedGetLeaderboard = vi.mocked(getLeaderboard);

const mockPlayers = [
    { _id: 'p1', username: 'alpha', mmr: 3000, rank: 'Elite',   wins: 50, losses: 10, winRate: 83.3, winStreak: 5, totalMatches: 60 },
    { _id: 'p2', username: 'beta',  mmr: 2500, rank: 'Master',  wins: 40, losses: 15, winRate: 72.7, winStreak: 2, totalMatches: 55 },
    { _id: 'p3', username: 'gamma', mmr: 2000, rank: 'Diamond', wins: 30, losses: 20, winRate: 60.0, winStreak: 0, totalMatches: 50 },
    { _id: 'p4', username: 'delta', mmr: 1500, rank: 'Gold',    wins: 20, losses: 25, winRate: 44.4, winStreak: 0, totalMatches: 45 },
];

function renderPage() {
    return render(
        <MemoryRouter>
            <Leaderboard />
        </MemoryRouter>
    );
}

describe('Leaderboard page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('shows the Leaderboard heading', () => {
        mockedGetLeaderboard.mockResolvedValueOnce([]);
        renderPage();
        expect(screen.getByRole('heading', { name: /leaderboard/i })).toBeInTheDocument();
    });

    it('shows player usernames after loading', async () => {
        mockedGetLeaderboard.mockResolvedValueOnce(mockPlayers);
        renderPage();

        await waitFor(() => {
            expect(screen.getByText('alpha')).toBeInTheDocument();
            expect(screen.getByText('beta')).toBeInTheDocument();
            expect(screen.getByText('gamma')).toBeInTheDocument();
            expect(screen.getByText('delta')).toBeInTheDocument();
        });
    });

    it('shows ranked players count after loading', async () => {
        mockedGetLeaderboard.mockResolvedValueOnce(mockPlayers);
        renderPage();

        await waitFor(() => {
            expect(screen.getByText(`${mockPlayers.length} ranked players`)).toBeInTheDocument();
        });
    });

    it('shows error message when loading fails', async () => {
        mockedGetLeaderboard.mockRejectedValueOnce(new Error('Network error'));
        renderPage();

        await waitFor(() => {
            expect(screen.getByText('Failed to load leaderboard')).toBeInTheDocument();
        });
    });

    it('calls getLeaderboard with limit 50', async () => {
        mockedGetLeaderboard.mockResolvedValueOnce([]);
        renderPage();

        await waitFor(() => {
            expect(mockedGetLeaderboard).toHaveBeenCalledWith(50);
        });
    });

    it('shows win rate for players', async () => {
        mockedGetLeaderboard.mockResolvedValueOnce(mockPlayers);
        renderPage();

        await waitFor(() => {
            expect(screen.getByText('83.3%')).toBeInTheDocument();
        });
    });
});
