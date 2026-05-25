import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Register from '../../pages/Register';
import { register } from '../../services/authService';

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
    register: vi.fn()
}));

function renderPage() {
    return render(
        <MemoryRouter initialEntries={['/register']}>
            <Routes>
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<p>Login page</p>} />
            </Routes>
        </MemoryRouter>
    );
}

describe('Register page', () => {

    it('renders title and fields', () => {
        renderPage();

        expect(screen.getByRole('heading', { name: 'Create account' })).toBeInTheDocument();
        expect(screen.getByLabelText('Username')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
    });

    it('shows error when passwords do not match', async () => {
        const user = userEvent.setup();
        renderPage();

        await user.type(screen.getByLabelText('Username'), 'vega');
        await user.type(screen.getByLabelText('Email'), 'vega@test.com');
        await user.type(screen.getByLabelText('Password'), '12345678');
        await user.type(screen.getByLabelText('Confirm password'), 'abcd1234');
        await user.click(screen.getByRole('button', { name: 'Create account' }));

        expect(await screen.findByText('Passwords do not match.')).toBeInTheDocument();
    });

    it('shows error when terms are not accepted', async () => {
        const user = userEvent.setup();
        renderPage();

        await user.type(screen.getByLabelText('Username'), 'vega');
        await user.type(screen.getByLabelText('Email'), 'vega@test.com');
        await user.type(screen.getByLabelText('Password'), '12345678');
        await user.type(screen.getByLabelText('Confirm password'), '12345678');
        await user.click(screen.getByRole('button', { name: 'Create account' }));

        expect(await screen.findByText('You must agree to the Terms and Privacy Policy.')).toBeInTheDocument();
    });

    it('calls register service on valid submit', async () => {
        const user = userEvent.setup();
        vi.mocked(register).mockResolvedValueOnce({ message: 'Account created successfully!' });

        renderPage();

        await user.type(screen.getByLabelText('Username'), 'vega');
        await user.type(screen.getByLabelText('Email'), 'vega@test.com');
        await user.type(screen.getByLabelText('Password'), '12345678');
        await user.type(screen.getByLabelText('Confirm password'), '12345678');
        await user.click(screen.getByRole('checkbox'));
        await user.click(screen.getByRole('button', { name: 'Create account' }));

        expect(register).toHaveBeenCalledWith('vega', 'vega@test.com', '12345678');
    });

});
