import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RankCard, { type Rank } from '../../components/landing/RankCard';
import type { LucideIcon } from 'lucide-react';

const MockRankIcon = (() => <svg data-testid="rank-icon" />) as unknown as LucideIcon;

const mockRank: Rank = {
    name: 'Gold',
    mmr: '1200-1499 MMR',
    color: '#FFD700',
    icon: MockRankIcon,
};

describe('RankCard', () => {

    it('renders rank name and mmr', () => {
        render(<RankCard rank={mockRank} isSelected={false} onSelect={vi.fn()} />);

        expect(screen.getByText('Gold')).toBeInTheDocument();
        expect(screen.getByText('1200-1499 MMR')).toBeInTheDocument();
    });

    it('calls onSelect when the card is clicked', async () => {
        const handleSelect = vi.fn();
        const user = userEvent.setup();

        render(<RankCard rank={mockRank} isSelected={false} onSelect={handleSelect} />);

        await user.click(screen.getByText('Gold'));

        expect(handleSelect).toHaveBeenCalledTimes(1);
    });

    it('applies selected style classes when isSelected is true', () => {
        const { container } = render(<RankCard rank={mockRank} isSelected onSelect={vi.fn()} />);
        const root = container.firstElementChild;

        expect(root).toHaveClass('border-2');
        expect(root).toHaveClass('ring-4');
    });

});
