import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Dashboard from '../../pages/Dashboard';
import { getProfile, logout } from '../../services/authService';

vi.mock('../../services/authService', () => ({
    getProfile: vi.fn(),
    logout: vi.fn()
}));

function renderPage() {
    return render(
        <MemoryRouter initialEntries={['/dashboard']}>
            <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/login" element={<p>Login page</p>} />
                <Route path="/lobbies" element={<p>Lobbies page</p>} />
            </Routes>
        </MemoryRouter>
    );
}

describe('Dashboard page', () => {

    it('renders user data after profile loads', async () => {
        vi.mocked(getProfile).mockResolvedValueOnce({
            user: {
                id: 'u1',
                username: 'vega',
                email: 'vega@test.com',
                rank: 'Gold',
                mmr: 1200,
                wins: 10,
                losses: 5,
                winRate: 66
            }
        } as never);

        renderPage();

        expect(await screen.findByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Username: vega')).toBeInTheDocument();
        expect(screen.getByText('MMR: 1200')).toBeInTheDocument();
    });

    it('redirects to login on unauthorized error', async () => {
        vi.mocked(getProfile).mockRejectedValueOnce({
            response: { status: 401 }
        });

        renderPage();

        expect(await screen.findByText('Login page')).toBeInTheDocument();
        expect(logout).toHaveBeenCalled();
    });

    it('navigates to lobbies and can logout', async () => {
        const user = userEvent.setup();
        vi.mocked(getProfile).mockResolvedValueOnce({
            user: {
                id: 'u1',
                username: 'vega',
                email: 'vega@test.com',
                rank: 'Gold',
                mmr: 1200,
                wins: 10,
                losses: 5,
                winRate: 66
            }
        } as never);

        renderPage();

        await screen.findByText('Dashboard');
        await user.click(screen.getByRole('button', { name: 'Lobbies' }));
        expect(await screen.findByText('Lobbies page')).toBeInTheDocument();
    });

});
