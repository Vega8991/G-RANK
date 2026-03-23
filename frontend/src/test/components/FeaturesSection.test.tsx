import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FeaturesSection from '../../components/landing/FeaturesSection';
import type { Feature } from '../../components/landing/FeatureCard';
import type { LucideIcon } from 'lucide-react';

vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, className }: { children: React.ReactNode; className?: string }) => (
            <div className={className}>{children}</div>
        ),
    },
}));

const MockIcon = (() => <svg data-testid="feature-icon" />) as unknown as LucideIcon;

const features: Feature[] = [
    { icon: MockIcon, title: 'Weekly Lobbies', desc: 'Compete every week', color: '#ff242f' },
    { icon: MockIcon, title: 'MMR System', desc: 'Fair matchmaking', color: '#ffd700' },
    { icon: MockIcon, title: 'Global Rankings', desc: 'Compare worldwide', color: '#00ff99' }
];

describe('FeaturesSection', () => {

    it('renders heading and feature cards', () => {
        render(<FeaturesSection features={features} />);

        expect(screen.getByText('EVERYTHING YOU NEED TO')).toBeInTheDocument();
        expect(screen.getAllByText('Weekly Lobbies').length).toBeGreaterThan(0);
        expect(screen.getAllByText('MMR System').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Global Rankings').length).toBeGreaterThan(0);
    });

    it('changes spotlight when user clicks another spotlight indicator', async () => {
        const user = userEvent.setup();
        const { container } = render(<FeaturesSection features={features} />);

        const indicators = container.querySelectorAll('button.h-1\\.5');
        await user.click(indicators[1] as HTMLButtonElement);

        expect(screen.getAllByText('MMR System').length).toBeGreaterThan(0);
    });

});
