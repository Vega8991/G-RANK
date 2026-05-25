import { render, screen } from '@testing-library/react';
import StatusBadge from '../../../components/admin/StatusBadge';

describe('StatusBadge', () => {
    it('renders lobby status open', () => {
        render(<StatusBadge status="open" />);
        expect(screen.getByText('open')).toBeInTheDocument();
    });

    it('renders lobby status closed', () => {
        render(<StatusBadge status="closed" />);
        expect(screen.getByText('closed')).toBeInTheDocument();
    });

    it('renders user status active', () => {
        render(<StatusBadge status="active" type="user" />);
        expect(screen.getByText('active')).toBeInTheDocument();
    });

    it('renders user status suspended', () => {
        render(<StatusBadge status="suspended" type="user" />);
        expect(screen.getByText('suspended')).toBeInTheDocument();
    });

    it('renders unknown status without crashing', () => {
        render(<StatusBadge status="unknown_status" />);
        expect(screen.getByText('unknown status')).toBeInTheDocument();
    });

    it('shows a dot indicator for lobby type', () => {
        const { container } = render(<StatusBadge status="open" type="lobby" />);
        const dot = container.querySelector('.rounded-full.w-1\\.5');
        expect(dot).toBeInTheDocument();
    });

    it('does not show a dot indicator for user type', () => {
        const { container } = render(<StatusBadge status="active" type="user" />);
        const dot = container.querySelector('.rounded-full.w-1\\.5');
        expect(dot).not.toBeInTheDocument();
    });
});
