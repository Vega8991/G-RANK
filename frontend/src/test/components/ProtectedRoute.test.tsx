import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../../components/auth/ProtectedRoute';

function setAuthCookie(username: string, role: string, expOffsetSeconds = 3600) {
    const exp = Math.floor(Date.now() / 1000) + expOffsetSeconds;
    const value = JSON.stringify({ username, role, exp });
    document.cookie = `auth_info=${encodeURIComponent(value)}`;
}

function clearAuthCookie() {
    document.cookie = 'auth_info=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
}

function renderWithRouter(props: { redirectTo?: string; requireAdmin?: boolean } = {}) {
    return render(
        <MemoryRouter initialEntries={['/']}>
            <Routes>
                <Route element={<ProtectedRoute {...props} />}>
                    <Route path="/" element={<p>Protected content</p>} />
                </Route>
                <Route path="/login" element={<p>Login page</p>} />
            </Routes>
        </MemoryRouter>
    );
}

describe('ProtectedRoute', () => {
    afterEach(() => {
        clearAuthCookie();
    });

    it('redirects to /login when there is no auth cookie', () => {
        renderWithRouter();
        expect(screen.getByText('Login page')).toBeInTheDocument();
    });

    it('renders protected content when the user is logged in', () => {
        setAuthCookie('vega', 'USER');
        renderWithRouter();
        expect(screen.getByText('Protected content')).toBeInTheDocument();
    });

    it('redirects to /login when the cookie is expired', () => {
        setAuthCookie('vega', 'USER', -100);
        renderWithRouter();
        expect(screen.getByText('Login page')).toBeInTheDocument();
    });

    it('blocks a regular user when requireAdmin is true', () => {
        setAuthCookie('vega', 'USER');
        renderWithRouter({ requireAdmin: true });
        expect(screen.getByText('Login page')).toBeInTheDocument();
    });

    it('allows an admin when requireAdmin is true', () => {
        setAuthCookie('admin', 'ADMIN');
        renderWithRouter({ requireAdmin: true });
        expect(screen.getByText('Protected content')).toBeInTheDocument();
    });

    it('redirects to a custom path when redirectTo is set', () => {
        render(
            <MemoryRouter initialEntries={['/']}>
                <Routes>
                    <Route element={<ProtectedRoute redirectTo="/custom-login" />}>
                        <Route path="/" element={<p>Protected content</p>} />
                    </Route>
                    <Route path="/custom-login" element={<p>Custom login page</p>} />
                </Routes>
            </MemoryRouter>
        );
        expect(screen.getByText('Custom login page')).toBeInTheDocument();
    });
});
