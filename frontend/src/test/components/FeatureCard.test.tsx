import { render, screen } from '@testing-library/react';
import FeatureCard, { type Feature } from '../../components/landing/FeatureCard';
import type { LucideIcon } from 'lucide-react';

vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, className }: { children: React.ReactNode; className?: string }) => (
            <div className={className}>{children}</div>
        ),
    },
}));

const MockIcon = (() => <svg data-testid="feature-icon" />) as unknown as LucideIcon;

const mockFeature: Feature = {
    icon: MockIcon,
    title: 'Ranked Matches',
    desc: 'Compete in ranked matches to climb the leaderboard.',
    color: '#dc143c',
};

describe('FeatureCard', () => {

    it('renders the feature title', () => {
        render(<FeatureCard feature={mockFeature} index={0} />);
        expect(screen.getByText('Ranked Matches')).toBeInTheDocument();
    });

    it('renders the feature description', () => {
        render(<FeatureCard feature={mockFeature} index={0} />);
        expect(screen.getByText('Compete in ranked matches to climb the leaderboard.')).toBeInTheDocument();
    });

    it('renders the "Learn more" button', () => {
        render(<FeatureCard feature={mockFeature} index={0} />);
        expect(screen.getByRole('button', { name: /learn more/i })).toBeInTheDocument();
    });

});
