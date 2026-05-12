import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AppLayout from '../../layouts/AppLayout';
import { prefetchRoute } from '../../services/routePrefetch';

vi.mock('../../services/routePrefetch', () => ({
    prefetchRoute: vi.fn()
}));

vi.mock('../../hooks/useViewportPrefetch', () => ({
    useViewportPrefetch: () => vi.fn()
}));

vi.mock('../../components/cursor/TargetCursor', () => ({
    default: function TargetCursorMock() {
        return <div data-testid="target-cursor" />;
    }
}));

function setAuthCookie(username: string, role: string, expOffsetSeconds = 3600) {
    const exp = Math.floor(Date.now() / 1000) + expOffsetSeconds;
    const value = JSON.stringify({ username, role, exp });
    document.cookie = `auth_info=${encodeURIComponent(value)}`;
}

function clearAuthCookie() {
    document.cookie = 'auth_info=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
}

function renderLayout() {
    return render(
        <MemoryRouter initialEntries={['/']}>
            <Routes>
                <Route element={<AppLayout />}>
                    <Route path="/" element={<p>Home page content</p>} />
                </Route>
            </Routes>
        </MemoryRouter>
    );
}

describe('AppLayout', () => {
    afterEach(() => {
        clearAuthCookie();
    });

    it('renders the G-RANK logo and navbar links', () => {
        renderLayout();

        expect(screen.getByText('G-RANK')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /lobbies/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /leaderboard/i })).toBeInTheDocument();
    });

    it('renders the outlet content', () => {
        renderLayout();
        expect(screen.getByText('Home page content')).toBeInTheDocument();
    });

    it('shows Login and Sign Up buttons when the user is not logged in', () => {
        renderLayout();
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
    });

    it('shows the username button when the user is logged in', () => {
        setAuthCookie('vega', 'USER');
        renderLayout();
        expect(screen.getByText('vega')).toBeInTheDocument();
    });

    it('shows the Admin link when the user is an admin', () => {
        setAuthCookie('admin', 'ADMIN');
        renderLayout();
        expect(screen.getByRole('link', { name: /admin/i })).toBeInTheDocument();
    });

    it('does not show the Admin link for regular users', () => {
        setAuthCookie('vega', 'USER');
        renderLayout();
        expect(screen.queryByRole('link', { name: /^admin$/i })).not.toBeInTheDocument();
    });

    it('calls prefetchRoute on login button hover when not logged in', () => {
        renderLayout();
        fireEvent.mouseEnter(screen.getByRole('link', { name: /login/i }));
        expect(prefetchRoute).toHaveBeenCalledWith('login');
    });
});
