import { render, screen } from '@testing-library/react';
import MmrProgressCard from '../../../components/dashboard/MmrProgressCard';
import type { User } from '../../../types';

vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, className }: { children: React.ReactNode; className?: string }) => (
            <div className={className}>{children}</div>
        ),
    },
}));

const baseUser: User = {
    _id: 'u1',
    username: 'vega',
    email: 'vega@test.com',
    role: 'USER',
    mmr: 1200,
    rank: 'Gold',
    wins: 20,
    losses: 10,
    winRate: 66.7,
    winStreak: 3,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('MmrProgressCard', () => {
    it('renders the rank name', () => {
        render(<MmrProgressCard user={baseUser} />);
        expect(screen.getByText('Gold')).toBeInTheDocument();
    });

    it('renders the MMR value', () => {
        render(<MmrProgressCard user={baseUser} />);
        expect(screen.getByText(/1[,.]?200 MMR/)).toBeInTheDocument();
    });

    it('shows the next rank name when not at max', () => {
        render(<MmrProgressCard user={baseUser} />);
        expect(screen.getAllByText('Platinum').length).toBeGreaterThan(0);
    });

    it('shows MMR needed to reach next rank', () => {
        render(<MmrProgressCard user={{ ...baseUser, mmr: 1200, rank: 'Gold' }} />);
        expect(screen.getByText(/300 MMR/)).toBeInTheDocument();
    });

    it('shows MAX label for Elite rank', () => {
        render(<MmrProgressCard user={{ ...baseUser, mmr: 3200, rank: 'Elite' }} />);
        expect(screen.getByText('MAX')).toBeInTheDocument();
    });

    it('shows Elite status message at max rank', () => {
        render(<MmrProgressCard user={{ ...baseUser, mmr: 3200, rank: 'Elite' }} />);
        expect(screen.getByText(/elite status achieved/i)).toBeInTheDocument();
    });
});
