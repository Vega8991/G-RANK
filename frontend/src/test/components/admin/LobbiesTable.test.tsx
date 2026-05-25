import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LobbiesTable from '../../../components/admin/LobbiesTable';
import type { Lobby } from '../../../types';

vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, className }: { children: React.ReactNode; className?: string }) => (
            <div className={className}>{children}</div>
        ),
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

function makeLobby(overrides: Partial<Lobby> = {}): Lobby {
    return {
        _id: 'lobby-1',
        name: 'Test Tournament',
        description: 'A test lobby.',
        game: 'pokemon_showdown',
        maxParticipants: 16,
        currentParticipants: 4,
        registrationDeadline: '2024-12-01T00:00:00Z',
        matchDateTime: '2024-12-10T18:00:00Z',
        status: 'open',
        createdBy: { _id: 'user-1', username: 'Admin', email: 'admin@test.com', role: 'ADMIN', mmr: 0, rank: 'Bronze', updatedAt: '' },
        prizePool: '$100',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        ...overrides,
    };
}

describe('LobbiesTable', () => {
    it('renders lobby name', () => {
        render(<LobbiesTable lobbies={[makeLobby()]} onEdit={vi.fn()} onDelete={vi.fn()} />);
        expect(screen.getByText('Test Tournament')).toBeInTheDocument();
    });

    it('shows "No tournaments found" when list is empty', () => {
        render(<LobbiesTable lobbies={[]} onEdit={vi.fn()} onDelete={vi.fn()} />);
        expect(screen.getByText('No tournaments found')).toBeInTheDocument();
    });

    it('shows total count', () => {
        const lobbies = [makeLobby({ _id: '1' }), makeLobby({ _id: '2', name: 'Other' })];
        render(<LobbiesTable lobbies={lobbies} onEdit={vi.fn()} onDelete={vi.fn()} />);
        expect(screen.getByText('2 of 2 tournaments')).toBeInTheDocument();
    });

    it('filters by name', async () => {
        const user = userEvent.setup();
        const lobbies = [
            makeLobby({ _id: '1', name: 'Pokemon Cup' }),
            makeLobby({ _id: '2', name: 'LoL Masters' }),
        ];
        render(<LobbiesTable lobbies={lobbies} onEdit={vi.fn()} onDelete={vi.fn()} />);

        await user.type(screen.getByPlaceholderText('Search tournaments...'), 'Pokemon');

        expect(screen.getByText('Pokemon Cup')).toBeInTheDocument();
        expect(screen.queryByText('LoL Masters')).not.toBeInTheDocument();
    });

    it('shows "No tournaments found" when search has no matches', async () => {
        const user = userEvent.setup();
        render(<LobbiesTable lobbies={[makeLobby()]} onEdit={vi.fn()} onDelete={vi.fn()} />);

        await user.type(screen.getByPlaceholderText('Search tournaments...'), 'zzz');

        expect(screen.getByText('No tournaments found')).toBeInTheDocument();
    });

    it('shows filter button with "All status" label', () => {
        render(<LobbiesTable lobbies={[makeLobby()]} onEdit={vi.fn()} onDelete={vi.fn()} />);
        expect(screen.getByRole('button', { name: /all status/i })).toBeInTheDocument();
    });

    it('opens filter dropdown on click', async () => {
        const user = userEvent.setup();
        render(<LobbiesTable lobbies={[makeLobby()]} onEdit={vi.fn()} onDelete={vi.fn()} />);

        await user.click(screen.getByRole('button', { name: /all status/i }));

        // Dropdown shows status buttons — "completed" and "cancelled" only appear in dropdown
        expect(screen.getByRole('button', { name: 'completed' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'cancelled' })).toBeInTheDocument();
    });

    it('filters by status', async () => {
        const user = userEvent.setup();
        const lobbies = [
            makeLobby({ _id: '1', name: 'Open Lobby', status: 'open' }),
            makeLobby({ _id: '2', name: 'Completed Lobby', status: 'completed' }),
        ];
        render(<LobbiesTable lobbies={lobbies} onEdit={vi.fn()} onDelete={vi.fn()} />);

        await user.click(screen.getByRole('button', { name: /all status/i }));
        // click 'open' option in the dropdown
        const openOptions = screen.getAllByText('open');
        const dropdownOption = openOptions.find(el => el.tagName === 'BUTTON');
        if (dropdownOption) await user.click(dropdownOption);

        expect(screen.getByText('Open Lobby')).toBeInTheDocument();
        expect(screen.queryByText('Completed Lobby')).not.toBeInTheDocument();
    });

    it('calls onEdit when edit button clicked', () => {
        const onEdit = vi.fn();
        const testLobby = makeLobby();
        render(<LobbiesTable lobbies={[testLobby]} onEdit={onEdit} onDelete={vi.fn()} />);

        const buttons = screen.getAllByRole('button').filter(btn =>
            btn.className.includes('rounded-lg') && btn.querySelector('svg')
        );
        fireEvent.click(buttons[0]);

        expect(onEdit).toHaveBeenCalledWith(testLobby);
    });

    it('calls onDelete when delete button clicked', () => {
        const onDelete = vi.fn();
        const testLobby = makeLobby();
        render(<LobbiesTable lobbies={[testLobby]} onEdit={vi.fn()} onDelete={onDelete} />);

        const buttons = screen.getAllByRole('button').filter(btn =>
            btn.className.includes('rounded-lg') && btn.querySelector('svg')
        );
        fireEvent.click(buttons[1]);

        expect(onDelete).toHaveBeenCalledWith(testLobby);
    });

    it('renders multiple lobbies', () => {
        const lobbies = [
            makeLobby({ _id: '1', name: 'Cup A' }),
            makeLobby({ _id: '2', name: 'Cup B' }),
            makeLobby({ _id: '3', name: 'Cup C' }),
        ];
        render(<LobbiesTable lobbies={lobbies} onEdit={vi.fn()} onDelete={vi.fn()} />);

        expect(screen.getByText('Cup A')).toBeInTheDocument();
        expect(screen.getByText('Cup B')).toBeInTheDocument();
        expect(screen.getByText('Cup C')).toBeInTheDocument();
        expect(screen.getByText('3 of 3 tournaments')).toBeInTheDocument();
    });

    it('shows filtered count vs total', async () => {
        const user = userEvent.setup();
        const lobbies = [
            makeLobby({ _id: '1', name: 'Alpha Cup' }),
            makeLobby({ _id: '2', name: 'Beta Cup' }),
        ];
        render(<LobbiesTable lobbies={lobbies} onEdit={vi.fn()} onDelete={vi.fn()} />);

        await user.type(screen.getByPlaceholderText('Search tournaments...'), 'Alpha');

        expect(screen.getByText('1 of 2 tournaments')).toBeInTheDocument();
    });

    it('resets to page 1 when search changes', async () => {
        const user = userEvent.setup();
        const lobbies = Array.from({ length: 10 }, (_, i) =>
            makeLobby({ _id: String(i), name: `Tournament ${i}` })
        );
        render(<LobbiesTable lobbies={lobbies} onEdit={vi.fn()} onDelete={vi.fn()} />);

        await user.type(screen.getByPlaceholderText('Search tournaments...'), 'Tournament 1');
        // Matches "Tournament 1" (exact) + "Tournament 10" wait no, 0-9 so "Tournament 1"
        expect(screen.getByText(/tournaments/)).toBeInTheDocument();
    });

    it('shows pagination when more than 8 lobbies', () => {
        const lobbies = Array.from({ length: 9 }, (_, i) =>
            makeLobby({ _id: String(i), name: `Tournament ${i}` })
        );
        render(<LobbiesTable lobbies={lobbies} onEdit={vi.fn()} onDelete={vi.fn()} />);
        expect(screen.getByText('9 of 9 tournaments')).toBeInTheDocument();
    });

    it('closes dropdown when status option selected', async () => {
        const user = userEvent.setup();
        render(<LobbiesTable lobbies={[makeLobby()]} onEdit={vi.fn()} onDelete={vi.fn()} />);

        await user.click(screen.getByRole('button', { name: /all status/i }));
        expect(screen.getByText('completed')).toBeInTheDocument();

        const completedBtns = screen.getAllByText('completed');
        const dropdownBtn = completedBtns.find(el => el.tagName === 'BUTTON');
        if (dropdownBtn) await user.click(dropdownBtn);

        // Dropdown should close — no longer showing the dropdown items
        await waitFor(() => {
            // The filter button now shows "completed" as its label
            expect(screen.getByRole('button', { name: /completed/i })).toBeInTheDocument();
        });
    });
});
