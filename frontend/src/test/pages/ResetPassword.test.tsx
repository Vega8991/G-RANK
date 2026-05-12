import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ResetPassword from '../../pages/ResetPassword';
import { resetPassword } from '../../services/authService';

vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, className }: { children: React.ReactNode; className?: string }) => (
            <div className={className}>{children}</div>
        ),
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../../components/ui/Aurora', () => ({
    default: function AuroraMock() {
        return <div data-testid="aurora" />;
    }
}));

vi.mock('../../services/authService', () => ({
    resetPassword: vi.fn(),
}));

function renderPage(token = 'valid-token') {
    return render(
        <MemoryRouter initialEntries={[`/reset-password?token=${token}`]}>
            <Routes>
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/login" element={<p>Login page</p>} />
            </Routes>
        </MemoryRouter>
    );
}

describe('ResetPassword page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the heading and form', () => {
        renderPage();
        expect(screen.getByRole('heading', { name: 'Reset password' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Set new password' })).toBeInTheDocument();
    });

    it('shows an error when passwords do not match', async () => {
        const user = userEvent.setup();
        renderPage();

        const inputs = screen.getAllByPlaceholderText(/characters|password/i);
        await user.type(inputs[0], 'password123');
        await user.type(inputs[1], 'different456');
        await user.click(screen.getByRole('button', { name: 'Set new password' }));

        expect(await screen.findByText('Passwords do not match.')).toBeInTheDocument();
    });

    it('shows success screen after a successful reset', async () => {
        const user = userEvent.setup();
        vi.mocked(resetPassword).mockResolvedValueOnce({ message: 'Password reset successfully.' });
        renderPage();

        const inputs = screen.getAllByPlaceholderText(/characters|password/i);
        await user.type(inputs[0], 'newpassword123');
        await user.type(inputs[1], 'newpassword123');
        await user.click(screen.getByRole('button', { name: 'Set new password' }));

        expect(await screen.findByRole('heading', { name: 'Password reset!' })).toBeInTheDocument();
    });

    it('calls resetPassword with the token from the URL and the new password', async () => {
        const user = userEvent.setup();
        vi.mocked(resetPassword).mockResolvedValueOnce({ message: 'ok' });
        renderPage('my-reset-token');

        const inputs = screen.getAllByPlaceholderText(/characters|password/i);
        await user.type(inputs[0], 'newpassword123');
        await user.type(inputs[1], 'newpassword123');
        await user.click(screen.getByRole('button', { name: 'Set new password' }));

        expect(resetPassword).toHaveBeenCalledWith('my-reset-token', 'newpassword123');
    });

    it('shows an error when the API call fails', async () => {
        const user = userEvent.setup();
        vi.mocked(resetPassword).mockRejectedValueOnce({
            response: { data: { message: 'Token has expired.' } }
        });
        renderPage();

        const inputs = screen.getAllByPlaceholderText(/characters|password/i);
        await user.type(inputs[0], 'newpassword123');
        await user.type(inputs[1], 'newpassword123');
        await user.click(screen.getByRole('button', { name: 'Set new password' }));

        expect(await screen.findByText('Token has expired.')).toBeInTheDocument();
    });
});
