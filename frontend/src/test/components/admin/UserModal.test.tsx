import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserModal from '../../../components/admin/UserModal';
import type { User } from '../../../types';

vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, className }: { children: React.ReactNode; className?: string }) => (
            <div className={className}>{children}</div>
        ),
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

function makeUser(overrides: Partial<User> = {}): User {
    return {
        _id: 'user-1',
        username: 'ProPlayer',
        email: 'pro@example.com',
        role: 'USER',
        status: 'active',
        mmr: 750,
        rank: 'Gold',
        updatedAt: '2024-01-01T00:00:00Z',
        ...overrides,
    };
}

describe('UserModal — create mode', () => {
    it('renders "Create User" heading', () => {
        render(<UserModal user={null} onSave={vi.fn()} onClose={vi.fn()} />);
        // Both h2 and submit button have "Create User" text
        const matches = screen.getAllByText('Create User');
        expect(matches.length).toBeGreaterThanOrEqual(1);
        expect(matches.some(el => el.tagName === 'H2')).toBe(true);
    });

    it('shows "Add a new platform user" subtitle', () => {
        render(<UserModal user={null} onSave={vi.fn()} onClose={vi.fn()} />);
        expect(screen.getByText('Add a new platform user')).toBeInTheDocument();
    });

    it('has empty username field by default', () => {
        render(<UserModal user={null} onSave={vi.fn()} onClose={vi.fn()} />);
        const usernameInput = screen.getByPlaceholderText('ProPlayer');
        expect(usernameInput).toHaveValue('');
    });

    it('shows "Create User" button', () => {
        render(<UserModal user={null} onSave={vi.fn()} onClose={vi.fn()} />);
        expect(screen.getByRole('button', { name: /create user/i })).toBeInTheDocument();
    });

    it('calls onClose when Cancel clicked', async () => {
        const user = userEvent.setup();
        const onClose = vi.fn();
        render(<UserModal user={null} onSave={vi.fn()} onClose={onClose} />);

        await user.click(screen.getByRole('button', { name: /cancel/i }));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onSave with form data when submitted', async () => {
        const user = userEvent.setup();
        const onSave = vi.fn().mockResolvedValue(undefined);
        render(<UserModal user={null} onSave={onSave} onClose={vi.fn()} />);

        await user.clear(screen.getByPlaceholderText('ProPlayer'));
        await user.type(screen.getByPlaceholderText('ProPlayer'), 'NewUser');
        await user.clear(screen.getByPlaceholderText('user@email.com'));
        await user.type(screen.getByPlaceholderText('user@email.com'), 'new@example.com');

        await user.click(screen.getByRole('button', { name: /create user/i }));

        await waitFor(() => {
            expect(onSave).toHaveBeenCalledWith(
                expect.objectContaining({
                    username: 'NewUser',
                    email: 'new@example.com',
                })
            );
        });
    });

    it('calls onClose after successful save', async () => {
        const user = userEvent.setup();
        const onClose = vi.fn();
        const onSave = vi.fn().mockResolvedValue(undefined);
        render(<UserModal user={null} onSave={onSave} onClose={onClose} />);

        await user.click(screen.getByRole('button', { name: /create user/i }));

        await waitFor(() => {
            expect(onClose).toHaveBeenCalled();
        });
    });

    it('shows error when onSave rejects', async () => {
        const user = userEvent.setup();
        const onSave = vi.fn().mockRejectedValue({
            response: { data: { message: 'Username already taken' } },
        });
        render(<UserModal user={null} onSave={onSave} onClose={vi.fn()} />);

        await user.click(screen.getByRole('button', { name: /create user/i }));

        await waitFor(() => {
            expect(screen.getByText('Username already taken')).toBeInTheDocument();
        });
    });

    it('shows fallback error when no message in response', async () => {
        const user = userEvent.setup();
        const onSave = vi.fn().mockRejectedValue(new Error('Network error'));
        render(<UserModal user={null} onSave={onSave} onClose={vi.fn()} />);

        await user.click(screen.getByRole('button', { name: /create user/i }));

        await waitFor(() => {
            expect(screen.getByText('Failed to save user')).toBeInTheDocument();
        });
    });
});

describe('UserModal — edit mode', () => {
    it('renders "Edit User" heading', () => {
        render(<UserModal user={makeUser()} onSave={vi.fn()} onClose={vi.fn()} />);
        expect(screen.getByText('Edit User')).toBeInTheDocument();
    });

    it('shows editing username subtitle', () => {
        render(<UserModal user={makeUser({ username: 'ProPlayer' })} onSave={vi.fn()} onClose={vi.fn()} />);
        expect(screen.getByText('Editing ProPlayer')).toBeInTheDocument();
    });

    it('pre-fills username field', () => {
        render(<UserModal user={makeUser({ username: 'ProPlayer' })} onSave={vi.fn()} onClose={vi.fn()} />);
        expect(screen.getByDisplayValue('ProPlayer')).toBeInTheDocument();
    });

    it('pre-fills email field', () => {
        render(<UserModal user={makeUser({ email: 'pro@example.com' })} onSave={vi.fn()} onClose={vi.fn()} />);
        expect(screen.getByDisplayValue('pro@example.com')).toBeInTheDocument();
    });

    it('pre-fills MMR field', () => {
        render(<UserModal user={makeUser({ mmr: 750 })} onSave={vi.fn()} onClose={vi.fn()} />);
        expect(screen.getByDisplayValue('750')).toBeInTheDocument();
    });

    it('shows "Save Changes" button', () => {
        render(<UserModal user={makeUser()} onSave={vi.fn()} onClose={vi.fn()} />);
        expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
    });

    it('role select has correct initial value', () => {
        render(<UserModal user={makeUser({ role: 'ADMIN' })} onSave={vi.fn()} onClose={vi.fn()} />);
        const roleSelect = screen.getByDisplayValue('Admin');
        expect(roleSelect).toBeInTheDocument();
    });

    it('rank select has correct initial value', () => {
        render(<UserModal user={makeUser({ rank: 'Diamond' })} onSave={vi.fn()} onClose={vi.fn()} />);
        expect(screen.getByDisplayValue('Diamond')).toBeInTheDocument();
    });

    it('status select has correct initial value', () => {
        render(<UserModal user={makeUser({ status: 'suspended' })} onSave={vi.fn()} onClose={vi.fn()} />);
        expect(screen.getByDisplayValue('Suspended')).toBeInTheDocument();
    });

    it('updates field on change', async () => {
        const user = userEvent.setup();
        render(<UserModal user={makeUser({ username: 'OldName' })} onSave={vi.fn()} onClose={vi.fn()} />);

        const usernameInput = screen.getByDisplayValue('OldName');
        await user.clear(usernameInput);
        await user.type(usernameInput, 'NewName');

        expect(screen.getByDisplayValue('NewName')).toBeInTheDocument();
    });

    it('does not include password in payload when left blank', async () => {
        const user = userEvent.setup();
        const onSave = vi.fn().mockResolvedValue(undefined);
        render(<UserModal user={makeUser()} onSave={onSave} onClose={vi.fn()} />);

        await user.click(screen.getByRole('button', { name: /save changes/i }));

        await waitFor(() => {
            const payload = onSave.mock.calls[0][0] as Record<string, unknown>;
            expect(payload).not.toHaveProperty('password');
        });
    });

    it('shows loading state while saving', async () => {
        const user = userEvent.setup();
        let resolve: () => void;
        const onSave = vi.fn().mockReturnValue(new Promise<void>(r => { resolve = r; }));
        render(<UserModal user={makeUser()} onSave={onSave} onClose={vi.fn()} />);

        await user.click(screen.getByRole('button', { name: /save changes/i }));

        expect(await screen.findByText('Saving...')).toBeInTheDocument();
        resolve!();
    });

    it('calls onClose when X button clicked', async () => {
        const user = userEvent.setup();
        const onClose = vi.fn();
        render(<UserModal user={makeUser()} onSave={vi.fn()} onClose={onClose} />);

        // X button (close icon at top right)
        const buttons = screen.getAllByRole('button');
        const xBtn = buttons.find(btn => btn.querySelector('svg') && btn.className.includes('w-8'));
        if (xBtn) await user.click(xBtn);

        expect(onClose).toHaveBeenCalled();
    });
});
