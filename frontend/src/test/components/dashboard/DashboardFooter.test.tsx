import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DashboardFooter from '../../../components/dashboard/DashboardFooter';

function renderFooter() {
    return render(<MemoryRouter><DashboardFooter /></MemoryRouter>);
}

describe('DashboardFooter', () => {
    it('renders the G-RANK logo text', () => {
        renderFooter();
        expect(screen.getByText('G-RANK')).toBeInTheDocument();
    });

    it('renders the copyright notice', () => {
        renderFooter();
        expect(screen.getByText(/G-RANK\. ALL RIGHTS RESERVED/i)).toBeInTheDocument();
    });

    it('renders game links', () => {
        renderFooter();
        expect(screen.getByText('Fortnite')).toBeInTheDocument();
        expect(screen.getByText('Valorant')).toBeInTheDocument();
    });

    it('renders tier labels', () => {
        renderFooter();
        expect(screen.getByText('Bronze → Silver → Gold')).toBeInTheDocument();
        expect(screen.getByText('Master → Elite')).toBeInTheDocument();
    });
});
