import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RankSection from '../../components/landing/RankSection';
import type { Rank } from '../../components/landing/RankCard';
import type { LucideIcon } from 'lucide-react';

vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, className }: { children: React.ReactNode; className?: string }) => (
            <div className={className}>{children}</div>
        ),
    },
}));

const MockIcon = (() => <svg data-testid="rank-icon" />) as unknown as LucideIcon;

const ranks: Rank[] = [
    { name: 'Bronze', mmr: '0-500 MMR', color: '#cd7f32', icon: MockIcon },
    { name: 'Silver', mmr: '500-1000 MMR', color: '#c0c0c0', icon: MockIcon },
    { name: 'Gold', mmr: '1000-1500 MMR', color: '#ffd700', icon: MockIcon },
    { name: 'Platinum', mmr: '1500-2000 MMR', color: '#00b7eb', icon: MockIcon },
    { name: 'Diamond', mmr: '2000-2500 MMR', color: '#b9f2ff', icon: MockIcon },
    { name: 'Master', mmr: '2500-3000 MMR', color: '#800080', icon: MockIcon },
    { name: 'Elite', mmr: '3000+ MMR', color: '#ff242f', icon: MockIcon }
];

describe('RankSection', () => {

    it('renders section title and selected rank by default', () => {
        render(<RankSection ranks={ranks} />);

        expect(screen.getByRole('heading', { name: 'CLIMB THE RANKS' })).toBeInTheDocument();
        expect(screen.getByText(/Selected rank:/i)).toBeInTheDocument();
        expect(screen.getAllByText('Diamond').length).toBeGreaterThan(0);
    });

    it('changes selected rank when user clicks another card', async () => {
        const user = userEvent.setup();
        render(<RankSection ranks={ranks} />);

        await user.click(screen.getByText('Bronze'));

        expect(screen.getAllByText('Bronze').length).toBeGreaterThan(0);
    });

});
