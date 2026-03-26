import { render, screen } from '@testing-library/react';
import Admin from '../../pages/Admin';
import ForgotPassword from '../../pages/ForgotPassword';
import Leaderboard from '../../pages/Leaderboard';
import Profile from '../../pages/Profile';

describe('Simple pages', () => {

    it('renders Admin page title', () => {
        render(<Admin />);
        expect(screen.getByRole('heading', { name: 'Admin' })).toBeInTheDocument();
    });

    it('renders Forgot Password page title', () => {
        render(<ForgotPassword />);
        expect(screen.getByRole('heading', { name: 'Forgot Password' })).toBeInTheDocument();
    });

    it('renders Leaderboard page title', () => {
        render(<Leaderboard />);
        expect(screen.getByRole('heading', { name: 'Leaderboard' })).toBeInTheDocument();
    });

    it('renders Profile page title', () => {
        render(<Profile />);
        expect(screen.getByRole('heading', { name: 'Profile' })).toBeInTheDocument();
    });

});
