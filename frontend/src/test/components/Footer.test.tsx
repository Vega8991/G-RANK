import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Footer from '../../components/landing/Footer';

describe('Footer', () => {

    it('renders the platform name and description', () => {
        render(
            <MemoryRouter>
                <Footer />
            </MemoryRouter>
        );

        expect(screen.getByText('G-RANK')).toBeInTheDocument();
        expect(screen.getByText('Pro esports platform with MMR-based matchmaking and competitive lobbies.')).toBeInTheDocument();
    });

    it('renders the main section titles', () => {
        render(
            <MemoryRouter>
                <Footer />
            </MemoryRouter>
        );

        expect(screen.getByRole('heading', { name: 'GAMES' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'TIERS' })).toBeInTheDocument();
    });

    it('renders footer utility links', () => {
        render(
            <MemoryRouter>
                <Footer />
            </MemoryRouter>
        );

        expect(screen.getByRole('link', { name: 'Privacy Policy' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Terms of Service' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Contact Us' })).toBeInTheDocument();
    });

});
