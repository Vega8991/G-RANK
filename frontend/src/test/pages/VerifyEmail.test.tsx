import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import VerifyEmail from '../../pages/VerifyEmail';
import apiClient from '../../services/apiClient';

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

vi.mock('../../services/apiClient', () => ({
    default: {
        get: vi.fn(),
    }
}));

function renderWithToken(token: string) {
    return render(
        <MemoryRouter initialEntries={[`/verify-email?token=${token}`]}>
            <Routes>
                <Route path="/verify-email" element={<VerifyEmail />} />
            </Routes>
        </MemoryRouter>
    );
}

function renderWithoutToken() {
    return render(
        <MemoryRouter initialEntries={['/verify-email']}>
            <Routes>
                <Route path="/verify-email" element={<VerifyEmail />} />
            </Routes>
        </MemoryRouter>
    );
}

describe('VerifyEmail page', () => {
    const mockedApiClient = vi.mocked(apiClient);

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('shows the loading state while verifying', () => {
        mockedApiClient.get.mockReturnValueOnce(new Promise(() => {}));

        renderWithToken('some-token');

        expect(screen.getByText('Verifying email...')).toBeInTheDocument();
    });

    it('shows the success state after verification succeeds', async () => {
        mockedApiClient.get.mockResolvedValueOnce({ data: { message: 'Email verified successfully!' } });

        renderWithToken('valid-token');

        expect(await screen.findByRole('heading', { name: 'Email verified!' })).toBeInTheDocument();
    });

    it('shows the success message from the server', async () => {
        mockedApiClient.get.mockResolvedValueOnce({ data: { message: 'Email verified successfully!' } });

        renderWithToken('valid-token');

        expect(await screen.findByText('Email verified successfully!')).toBeInTheDocument();
    });

    it('shows the error state when verification fails', async () => {
        mockedApiClient.get.mockRejectedValueOnce({
            response: { data: { message: 'Invalid or expired token.' } }
        });

        renderWithToken('bad-token');

        expect(await screen.findByRole('heading', { name: 'Verification failed' })).toBeInTheDocument();
        expect(await screen.findByText('Invalid or expired token.')).toBeInTheDocument();
    });

    it('shows an error immediately when there is no token in the URL', () => {
        renderWithoutToken();

        expect(screen.getByRole('heading', { name: 'Verification failed' })).toBeInTheDocument();
        expect(screen.getByText('Missing verification token.')).toBeInTheDocument();
    });

    it('shows a sign in link after successful verification', async () => {
        mockedApiClient.get.mockResolvedValueOnce({ data: { message: 'Verified!' } });

        renderWithToken('valid-token');

        expect(await screen.findByRole('link', { name: 'Sign in' })).toBeInTheDocument();
    });
});
