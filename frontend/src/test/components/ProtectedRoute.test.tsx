import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../../components/auth/ProtectedRoute';

function renderWithRouter(props: { isAllowed?: boolean; requireAdmin?: boolean } = {}) {
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
        localStorage.clear();
    });

    it('redirects to /login when there is no token in localStorage', () => {
        renderWithRouter();
        expect(screen.getByText('Login page')).toBeInTheDocument();
    });

    it('renders the protected content when the user is authenticated', () => {
        localStorage.setItem('token', 'fake-token');
        localStorage.setItem('user', JSON.stringify({ role: 'USER' }));

        renderWithRouter();

        expect(screen.getByText('Protected content')).toBeInTheDocument();
    });

    it('redirects when isAllowed is explicitly false', () => {
        localStorage.setItem('token', 'fake-token');
        localStorage.setItem('user', JSON.stringify({ role: 'USER' }));

        renderWithRouter({ isAllowed: false });

        expect(screen.getByText('Login page')).toBeInTheDocument();
    });

});
