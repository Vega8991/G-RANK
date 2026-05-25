import { render, screen } from '@testing-library/react';
import { Users } from 'lucide-react';
import StatCard from '../../../components/admin/StatCard';

vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, className }: { children: React.ReactNode; className?: string }) => (
            <div className={className}>{children}</div>
        ),
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('StatCard', () => {
    const defaultProps = {
        label: 'Total Users',
        value: 42,
        icon: Users,
        color: '#dc143c',
        bg: 'rgba(220,20,60,0.1)',
    };

    it('renders label text', () => {
        render(<StatCard {...defaultProps} />);
        expect(screen.getByText('Total Users')).toBeInTheDocument();
    });

    it('renders value', () => {
        render(<StatCard {...defaultProps} />);
        expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('renders large value', () => {
        render(<StatCard {...defaultProps} value={1500} />);
        // toLocaleString output varies by environment; just ensure value element exists
        expect(screen.getByText(/1[,.]?500/)).toBeInTheDocument();
    });

    it('renders zero value', () => {
        render(<StatCard {...defaultProps} value={0} />);
        expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('renders different labels', () => {
        render(<StatCard {...defaultProps} label="Active Lobbies" />);
        expect(screen.getByText('Active Lobbies')).toBeInTheDocument();
    });
});
