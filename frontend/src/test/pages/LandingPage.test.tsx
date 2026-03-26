import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LandingPage from '../../pages/LandingPage';
import { prefetchRoute } from '../../services/routePrefetch';

vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, className }: { children: React.ReactNode; className?: string }) => (
            <div className={className}>{children}</div>
        ),
    },
}));

vi.mock('../../components/ui/LiquidEther', () => ({
    default: function LiquidEtherMock() {
        return <div data-testid="liquid-ether" />;
    }
}));

vi.mock('../../components/landing/HeroSection', () => ({
    default: function HeroSectionMock() {
        return <section><h2>Hero mocked</h2></section>;
    }
}));

vi.mock('../../components/landing/SponsorsMarquee', () => ({
    default: function SponsorsMarqueeMock() {
        return <section><p>Sponsors mocked</p></section>;
    }
}));

vi.mock('../../hooks/useViewportPrefetch', () => ({
    useViewportPrefetch: () => vi.fn()
}));

vi.mock('../../services/routePrefetch', () => ({
    prefetchRoute: vi.fn()
}));

describe('LandingPage', () => {

    it('renders key sections and content', () => {
        render(
            <MemoryRouter>
                <LandingPage />
            </MemoryRouter>
        );

        expect(screen.getByText('Hero mocked')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'CLIMB THE RANKS' })).toBeInTheDocument();
        expect(screen.getByText('EVERYTHING YOU NEED TO')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'READY TO COMPETE?' })).toBeInTheDocument();
        expect(screen.getByText('G-RANK')).toBeInTheDocument();
    });

    it('updates selected rank when a rank card is clicked', () => {
        render(
            <MemoryRouter>
                <LandingPage />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByText('Bronze'));

        expect(screen.getByText(/Selected rank:/i)).toBeInTheDocument();
        expect(screen.getAllByText('Bronze').length).toBeGreaterThan(0);
    });

    it('calls prefetchRoute on CTA links hover', () => {
        render(
            <MemoryRouter>
                <LandingPage />
            </MemoryRouter>
        );

        fireEvent.mouseEnter(screen.getByRole('link', { name: /create free account/i }));
        fireEvent.mouseEnter(screen.getByRole('link', { name: /view lobbies/i }));

        expect(prefetchRoute).toHaveBeenCalledWith('register');
        expect(prefetchRoute).toHaveBeenCalledWith('lobbies');
    });

});
