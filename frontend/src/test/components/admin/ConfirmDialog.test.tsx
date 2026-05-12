import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConfirmDialog from '../../../components/admin/ConfirmDialog';

vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) => (
            <div className={className} onClick={onClick}>{children}</div>
        ),
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('ConfirmDialog', () => {
    it('renders the message text', () => {
        render(
            <ConfirmDialog
                message="Are you sure you want to delete this user?"
                onConfirm={vi.fn()}
                onCancel={vi.fn()}
            />
        );
        expect(screen.getByText('Are you sure you want to delete this user?')).toBeInTheDocument();
    });

    it('renders the Confirm deletion heading', () => {
        render(
            <ConfirmDialog message="Delete?" onConfirm={vi.fn()} onCancel={vi.fn()} />
        );
        expect(screen.getByText('Confirm deletion')).toBeInTheDocument();
    });

    it('calls onConfirm when Delete button is clicked', async () => {
        const user = userEvent.setup();
        const onConfirm = vi.fn();

        render(<ConfirmDialog message="Delete?" onConfirm={onConfirm} onCancel={vi.fn()} />);

        await user.click(screen.getByRole('button', { name: /delete/i }));
        expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel when Cancel button is clicked', async () => {
        const user = userEvent.setup();
        const onCancel = vi.fn();

        render(<ConfirmDialog message="Delete?" onConfirm={vi.fn()} onCancel={onCancel} />);

        await user.click(screen.getByRole('button', { name: /cancel/i }));
        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('shows the irreversible warning text', () => {
        render(<ConfirmDialog message="Delete?" onConfirm={vi.fn()} onCancel={vi.fn()} />);
        expect(screen.getByText('This action cannot be undone')).toBeInTheDocument();
    });
});
