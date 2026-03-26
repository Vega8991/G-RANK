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

describe('AppLayout', () => {

    it('renders navbar links and outlet content', () => {
        render(
            <MemoryRouter initialEntries={['/']}>
                <Routes>
                    <Route element={<AppLayout />}>
                        <Route path="/" element={<p>Home page content</p>} />
                    </Route>
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('G-RANK')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /lobbies/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /leaderboard/i })).toBeInTheDocument();
        expect(screen.getByText('Home page content')).toBeInTheDocument();
    });

    it('calls prefetchRoute on login hover', () => {
        render(
            <MemoryRouter>
                <Routes>
                    <Route element={<AppLayout />}>
                        <Route path="/" element={<p>Home page content</p>} />
                    </Route>
                </Routes>
            </MemoryRouter>
        );

        fireEvent.mouseEnter(screen.getByRole('link', { name: /login/i }));
        expect(prefetchRoute).toHaveBeenCalledWith('login');
    });

});
