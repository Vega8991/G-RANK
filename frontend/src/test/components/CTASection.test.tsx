import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CTASection from '../../components/landing/CTASection';

vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, className }: { children: React.ReactNode; className?: string }) => (
            <div className={className}>{children}</div>
        ),
    },
}));

describe('CTASection', () => {

    it('shows the main title', () => {
        render(
            <MemoryRouter>
                <CTASection />
            </MemoryRouter>
        );

        expect(screen.getByRole('heading', { name: 'READY TO COMPETE?' })).toBeInTheDocument();
    });

    it('shows the main description text', () => {
        render(
            <MemoryRouter>
                <CTASection />
            </MemoryRouter>
        );

        expect(screen.getByText('Join thousands of players competing for glory. Create your account and start your journey to Elite rank today.')).toBeInTheDocument();
    });

    it('shows one of the benefit items', () => {
        render(
            <MemoryRouter>
                <CTASection />
            </MemoryRouter>
        );

        expect(screen.getByText('Competitive ranking system')).toBeInTheDocument();
    });

    it('has a link to register', () => {
        render(
            <MemoryRouter>
                <CTASection />
            </MemoryRouter>
        );

        const registerLink = screen.getByRole('link', { name: /create free account/i });
        expect(registerLink).toHaveAttribute('href', '/register');
    });

    it('has a link to lobbies', () => {
        render(
            <MemoryRouter>
                <CTASection />
            </MemoryRouter>
        );

        const lobbiesLink = screen.getByRole('link', { name: /view lobbies/i });
        expect(lobbiesLink).toHaveAttribute('href', '/lobbies');
    });

});
