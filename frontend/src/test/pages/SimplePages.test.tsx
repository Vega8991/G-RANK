import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NotFound from '../../pages/NotFound';

vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, className }: { children: React.ReactNode; className?: string }) => (
            <div className={className}>{children}</div>
        ),
        p: ({ children, className }: { children: React.ReactNode; className?: string }) => (
            <p className={className}>{children}</p>
        ),
    },
}));

vi.mock('../../components/ui/Aurora', () => ({
    default: function AuroraMock() {
        return <div data-testid="aurora" />;
    }
}));

function renderWithRouter(element: React.ReactNode) {
    return render(<MemoryRouter>{element}</MemoryRouter>);
}

describe('NotFound page', () => {
    it('shows 404', () => {
        renderWithRouter(<NotFound />);
        expect(screen.getByText('404')).toBeInTheDocument();
    });

    it('shows the page not found heading', () => {
        renderWithRouter(<NotFound />);
        expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
    });

    it('shows a back to home link', () => {
        renderWithRouter(<NotFound />);
        expect(screen.getByRole('link', { name: /back to home/i })).toBeInTheDocument();
    });
});
