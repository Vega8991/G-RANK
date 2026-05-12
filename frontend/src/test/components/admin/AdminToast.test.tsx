import { render, screen, act } from '@testing-library/react';
import AdminToast from '../../../components/admin/AdminToast';

vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, className }: { children: React.ReactNode; className?: string }) => (
            <div className={className}>{children}</div>
        ),
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('AdminToast', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('renders the message text', () => {
        render(<AdminToast message="User created" ok={true} onDone={vi.fn()} />);
        expect(screen.getByText('User created')).toBeInTheDocument();
    });

    it('calls onDone after 3 seconds', () => {
        const onDone = vi.fn();
        render(<AdminToast message="Done" ok={true} onDone={onDone} />);

        expect(onDone).not.toHaveBeenCalled();

        act(() => {
            vi.advanceTimersByTime(3000);
        });

        expect(onDone).toHaveBeenCalledTimes(1);
    });

    it('does not call onDone before 3 seconds', () => {
        const onDone = vi.fn();
        render(<AdminToast message="Wait" ok={true} onDone={onDone} />);

        act(() => {
            vi.advanceTimersByTime(2999);
        });

        expect(onDone).not.toHaveBeenCalled();
    });

    it('renders with success styling when ok is true', () => {
        const { container } = render(<AdminToast message="Success" ok={true} onDone={vi.fn()} />);
        expect(container.firstChild).toHaveClass('text-green-300');
    });

    it('renders with error styling when ok is false', () => {
        const { container } = render(<AdminToast message="Error" ok={false} onDone={vi.fn()} />);
        expect(container.firstChild).toHaveClass('text-red-300');
    });
});
