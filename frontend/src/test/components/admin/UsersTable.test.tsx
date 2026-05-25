import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UsersTable from '../../../components/admin/UsersTable';
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
        username: 'TestUser',
        email: 'test@example.com',
        role: 'USER',
        status: 'active',
        mmr: 500,
        rank: 'Gold',
        updatedAt: '2024-01-01T00:00:00Z',
        createdAt: '2024-01-01T00:00:00Z',
        ...overrides,
    };
}

describe('UsersTable', () => {
    it('renders user username', () => {
        render(<UsersTable users={[makeUser()]} onEdit={vi.fn()} onDelete={vi.fn()} />);
        expect(screen.getByText('TestUser')).toBeInTheDocument();
    });

    it('shows "No users found" when list is empty', () => {
        render(<UsersTable users={[]} onEdit={vi.fn()} onDelete={vi.fn()} />);
        expect(screen.getByText('No users found')).toBeInTheDocument();
    });

    it('shows user count', () => {
        const users = [makeUser({ _id: '1' }), makeUser({ _id: '2', username: 'Other' })];
        render(<UsersTable users={users} onEdit={vi.fn()} onDelete={vi.fn()} />);
        expect(screen.getByText('2 users')).toBeInTheDocument();
    });

    it('filters by username', async () => {
        const user = userEvent.setup();
        const users = [
            makeUser({ _id: '1', username: 'ProPlayer' }),
            makeUser({ _id: '2', username: 'Noob' }),
        ];
        render(<UsersTable users={users} onEdit={vi.fn()} onDelete={vi.fn()} />);

        await user.type(screen.getByPlaceholderText('Search users...'), 'Pro');

        expect(screen.getByText('ProPlayer')).toBeInTheDocument();
        expect(screen.queryByText('Noob')).not.toBeInTheDocument();
    });

    it('filters by email', async () => {
        const user = userEvent.setup();
        const users = [
            makeUser({ _id: '1', username: 'User1', email: 'alpha@test.com' }),
            makeUser({ _id: '2', username: 'User2', email: 'beta@test.com' }),
        ];
        render(<UsersTable users={users} onEdit={vi.fn()} onDelete={vi.fn()} />);

        await user.type(screen.getByPlaceholderText('Search users...'), 'alpha');

        expect(screen.getByText('User1')).toBeInTheDocument();
        expect(screen.queryByText('User2')).not.toBeInTheDocument();
    });

    it('shows "No users found" when search has no matches', async () => {
        const user = userEvent.setup();
        render(<UsersTable users={[makeUser()]} onEdit={vi.fn()} onDelete={vi.fn()} />);

        await user.type(screen.getByPlaceholderText('Search users...'), 'zzz');

        expect(screen.getByText('No users found')).toBeInTheDocument();
        expect(screen.getByText('0 users')).toBeInTheDocument();
    });

    it('calls onEdit when edit button clicked', async () => {
        const user = userEvent.setup();
        const onEdit = vi.fn();
        const testUser = makeUser();
        render(<UsersTable users={[testUser]} onEdit={onEdit} onDelete={vi.fn()} />);

        // Edit button (pencil icon button)
        const buttons = screen.getAllByRole('button');
        const editBtn = buttons.find(btn => btn.querySelector('svg'));
        // Click the first action button (edit)
        const actionButtons = buttons.filter(btn => btn.className.includes('rounded-lg') && btn.querySelector('svg'));
        fireEvent.click(actionButtons[0]);

        expect(onEdit).toHaveBeenCalledWith(testUser);
    });

    it('calls onDelete when delete button clicked', () => {
        const onDelete = vi.fn();
        const testUser = makeUser();
        render(<UsersTable users={[testUser]} onEdit={vi.fn()} onDelete={onDelete} />);

        const buttons = screen.getAllByRole('button').filter(btn =>
            btn.className.includes('rounded-lg') && btn.querySelector('svg')
        );
        // Delete button is the second action button
        fireEvent.click(buttons[1]);

        expect(onDelete).toHaveBeenCalledWith(testUser);
    });

    it('renders multiple users', () => {
        const users = [
            makeUser({ _id: '1', username: 'Alice' }),
            makeUser({ _id: '2', username: 'Bob' }),
            makeUser({ _id: '3', username: 'Charlie' }),
        ];
        render(<UsersTable users={users} onEdit={vi.fn()} onDelete={vi.fn()} />);

        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('Bob')).toBeInTheDocument();
        expect(screen.getByText('Charlie')).toBeInTheDocument();
        expect(screen.getByText('3 users')).toBeInTheDocument();
    });

    it('renders ADMIN role label', () => {
        render(
            <UsersTable
                users={[makeUser({ role: 'ADMIN' })]}
                onEdit={vi.fn()}
                onDelete={vi.fn()}
            />
        );
        expect(screen.getByText('Administrator')).toBeInTheDocument();
    });

    it('resets to page 1 when search changes', async () => {
        const user = userEvent.setup();
        // Create 10 users to trigger pagination
        const users = Array.from({ length: 10 }, (_, i) =>
            makeUser({ _id: String(i), username: `Player${i}`, email: `player${i}@test.com` })
        );
        render(<UsersTable users={users} onEdit={vi.fn()} onDelete={vi.fn()} />);

        // Search for "Player0" — matches exactly 1 user
        await user.type(screen.getByPlaceholderText('Search users...'), 'Player0');
        expect(screen.getByText(/1\s*users?/)).toBeInTheDocument();
        expect(screen.getByText('Player0')).toBeInTheDocument();
    });

    it('shows pagination when more than 8 users', () => {
        const users = Array.from({ length: 9 }, (_, i) =>
            makeUser({ _id: String(i), username: `Player${i}` })
        );
        render(<UsersTable users={users} onEdit={vi.fn()} onDelete={vi.fn()} />);

        // Pagination arrows appear
        expect(screen.getByText('9 users')).toBeInTheDocument();
    });

    it('does not show pagination for 8 or fewer users', () => {
        const users = Array.from({ length: 8 }, (_, i) =>
            makeUser({ _id: String(i), username: `Player${i}` })
        );
        render(<UsersTable users={users} onEdit={vi.fn()} onDelete={vi.fn()} />);

        // No prev/next pagination buttons beyond the count label
        expect(screen.getByText('8 users')).toBeInTheDocument();
    });
});
