import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ForgotPassword from '../../pages/ForgotPassword';
import { forgotPassword } from '../../services/authService';

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
    forgotPassword: vi.fn(),
}));

function renderPage() {
    return render(
        <MemoryRouter>
            <ForgotPassword />
        </MemoryRouter>
    );
}

describe('ForgotPassword page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the heading and email input', () => {
        renderPage();
        expect(screen.getByRole('heading', { name: 'Forgot password?' })).toBeInTheDocument();
        expect(screen.getByLabelText('Email address')).toBeInTheDocument();
    });

    it('renders the send reset link button', () => {
        renderPage();
        expect(screen.getByRole('button', { name: 'Send reset link' })).toBeInTheDocument();
    });

    it('shows the success screen after a successful submission', async () => {
        const user = userEvent.setup();
        vi.mocked(forgotPassword).mockResolvedValueOnce({ message: 'ok' });

        renderPage();

        await user.type(screen.getByLabelText('Email address'), 'vega@test.com');
        await user.click(screen.getByRole('button', { name: 'Send reset link' }));

        expect(await screen.findByRole('heading', { name: 'Check your inbox' })).toBeInTheDocument();
    });

    it('shows the submitted email in the success screen', async () => {
        const user = userEvent.setup();
        vi.mocked(forgotPassword).mockResolvedValueOnce({ message: 'ok' });

        renderPage();

        await user.type(screen.getByLabelText('Email address'), 'vega@test.com');
        await user.click(screen.getByRole('button', { name: 'Send reset link' }));

        expect(await screen.findByText('vega@test.com')).toBeInTheDocument();
    });

    it('shows an error message when the request fails', async () => {
        const user = userEvent.setup();
        vi.mocked(forgotPassword).mockRejectedValueOnce({
            response: { data: { message: 'Too many attempts' } }
        });

        renderPage();

        await user.type(screen.getByLabelText('Email address'), 'vega@test.com');
        await user.click(screen.getByRole('button', { name: 'Send reset link' }));

        expect(await screen.findByText('Too many attempts')).toBeInTheDocument();
    });

    it('calls forgotPassword with the typed email', async () => {
        const user = userEvent.setup();
        vi.mocked(forgotPassword).mockResolvedValueOnce({ message: 'ok' });

        renderPage();

        await user.type(screen.getByLabelText('Email address'), 'vega@test.com');
        await user.click(screen.getByRole('button', { name: 'Send reset link' }));

        expect(forgotPassword).toHaveBeenCalledWith('vega@test.com');
    });
});
