import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HeroSection from '../../components/landing/HeroSection';
import { prefetchRoute } from '../../services/routePrefetch';

vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, className }: { children: React.ReactNode; className?: string }) => (
            <div className={className}>{children}</div>
        ),
    },
}));

vi.mock('../../components/landing/ReactiveBackground', () => ({
    default: function ReactiveBackgroundMock() {
        return <div data-testid="reactive-bg" />;
    }
}));

vi.mock('../../hooks/useViewportPrefetch', () => ({
    useViewportPrefetch: () => vi.fn()
}));

vi.mock('../../services/routePrefetch', () => ({
    prefetchRoute: vi.fn()
}));

describe('HeroSection', () => {

    it('renders hero title and action buttons', () => {
        render(
            <MemoryRouter>
                <HeroSection />
            </MemoryRouter>
        );

        expect(screen.getByText('DOMINATE THE')).toBeInTheDocument();
        expect(screen.getByText('LEADERBOARD')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /start competing/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /view rankings/i })).toBeInTheDocument();
    });

    it('calls prefetchRoute on mouse enter over links', () => {
        render(
            <MemoryRouter>
                <HeroSection />
            </MemoryRouter>
        );

        fireEvent.mouseEnter(screen.getByRole('link', { name: /start competing/i }));
        fireEvent.mouseEnter(screen.getByRole('link', { name: /login/i }));

        expect(prefetchRoute).toHaveBeenCalledWith('register');
        expect(prefetchRoute).toHaveBeenCalledWith('login');
    });

});
