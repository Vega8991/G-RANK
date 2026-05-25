import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Login from '../../pages/Login';
import { login } from '../../services/authService';

vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, className }: { children: React.ReactNode; className?: string }) => (
            <div className={className}>{children}</div>
        ),
        h1: ({ children, className }: { children: React.ReactNode; className?: string }) => (
            <h1 className={className}>{children}</h1>
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

vi.mock('../../services/authService', () => ({
    login: vi.fn()
}));

function renderPage() {
    return render(
        <MemoryRouter initialEntries={['/login']}>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<p>Dashboard page</p>} />
            </Routes>
        </MemoryRouter>
    );
}

describe('Login page', () => {

    it('renders title and form labels', () => {
        renderPage();

        expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
    });

    it('toggles password visibility', async () => {
        const user = userEvent.setup();
        renderPage();

        const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
        const toggleButton = passwordInput.parentElement?.querySelector('button') as HTMLButtonElement;

        expect(passwordInput.type).toBe('password');
        await user.click(toggleButton);
        expect(passwordInput.type).toBe('text');
    });

    it('shows backend error message when login fails', async () => {
        const user = userEvent.setup();
        vi.mocked(login).mockRejectedValueOnce({
            response: {
                data: {
                    message: 'Invalid credentials from api'
                }
            }
        });

        renderPage();

        await user.type(screen.getByLabelText('Email'), 'vega@test.com');
        await user.type(screen.getByLabelText('Password'), '12345678');
        await user.click(screen.getByRole('button', { name: 'Sign in' }));

        expect(await screen.findByText('Invalid credentials from api')).toBeInTheDocument();
    });

});
