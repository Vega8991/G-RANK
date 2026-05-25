import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LobbyModal from '../../../components/admin/LobbyModal';
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
        name: 'Epic Tournament',
        description: 'An epic competition for all ranks.',
        game: 'pokemon_showdown',
        maxParticipants: 16,
        currentParticipants: 4,
        registrationDeadline: '2024-12-01T00:00:00Z',
        matchDateTime: '2024-12-10T18:00:00Z',
        status: 'open',
        createdBy: 'user-1',
        prizePool: '$100',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        ...overrides,
    };
}

describe('LobbyModal', () => {
    it('renders "Edit Tournament" heading', () => {
        render(<LobbyModal lobby={makeLobby()} onSave={vi.fn()} onClose={vi.fn()} />);
        expect(screen.getByText('Edit Tournament')).toBeInTheDocument();
    });

    it('shows lobby name in subtitle', () => {
        render(<LobbyModal lobby={makeLobby({ name: 'Epic Tournament' })} onSave={vi.fn()} onClose={vi.fn()} />);
        expect(screen.getByText('Epic Tournament')).toBeInTheDocument();
    });

    it('pre-fills name field', () => {
        render(<LobbyModal lobby={makeLobby({ name: 'Epic Tournament' })} onSave={vi.fn()} onClose={vi.fn()} />);
        expect(screen.getByDisplayValue('Epic Tournament')).toBeInTheDocument();
    });

    it('pre-fills description field', () => {
        render(<LobbyModal lobby={makeLobby({ description: 'An epic competition for all ranks.' })} onSave={vi.fn()} onClose={vi.fn()} />);
        expect(screen.getByDisplayValue('An epic competition for all ranks.')).toBeInTheDocument();
    });

    it('pre-fills maxParticipants field', () => {
        render(<LobbyModal lobby={makeLobby({ maxParticipants: 16 })} onSave={vi.fn()} onClose={vi.fn()} />);
        expect(screen.getByDisplayValue('16')).toBeInTheDocument();
    });

    it('pre-fills prizePool field', () => {
        render(<LobbyModal lobby={makeLobby({ prizePool: '$100' })} onSave={vi.fn()} onClose={vi.fn()} />);
        expect(screen.getByDisplayValue('$100')).toBeInTheDocument();
    });

    it('shows "Save Changes" button', () => {
        render(<LobbyModal lobby={makeLobby()} onSave={vi.fn()} onClose={vi.fn()} />);
        expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
    });

    it('calls onClose when Cancel clicked', async () => {
        const user = userEvent.setup();
        const onClose = vi.fn();
        render(<LobbyModal lobby={makeLobby()} onSave={vi.fn()} onClose={onClose} />);

        await user.click(screen.getByRole('button', { name: /cancel/i }));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onSave with form data when submitted', async () => {
        const user = userEvent.setup();
        const onSave = vi.fn().mockResolvedValue(undefined);
        render(<LobbyModal lobby={makeLobby()} onSave={onSave} onClose={vi.fn()} />);

        await user.click(screen.getByRole('button', { name: /save changes/i }));

        await waitFor(() => {
            expect(onSave).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'Epic Tournament',
                    description: 'An epic competition for all ranks.',
                    maxParticipants: 16,
                    status: 'open',
                })
            );
        });
    });

    it('calls onClose after successful save', async () => {
        const user = userEvent.setup();
        const onClose = vi.fn();
        const onSave = vi.fn().mockResolvedValue(undefined);
        render(<LobbyModal lobby={makeLobby()} onSave={onSave} onClose={onClose} />);

        await user.click(screen.getByRole('button', { name: /save changes/i }));

        await waitFor(() => {
            expect(onClose).toHaveBeenCalled();
        });
    });

    it('shows error when onSave rejects', async () => {
        const user = userEvent.setup();
        const onSave = vi.fn().mockRejectedValue({
            response: { data: { message: 'Invalid game' } },
        });
        render(<LobbyModal lobby={makeLobby()} onSave={onSave} onClose={vi.fn()} />);

        await user.click(screen.getByRole('button', { name: /save changes/i }));

        await waitFor(() => {
            expect(screen.getByText('Invalid game')).toBeInTheDocument();
        });
    });

    it('shows fallback error message', async () => {
        const user = userEvent.setup();
        const onSave = vi.fn().mockRejectedValue(new Error('Oops'));
        render(<LobbyModal lobby={makeLobby()} onSave={onSave} onClose={vi.fn()} />);

        await user.click(screen.getByRole('button', { name: /save changes/i }));

        await waitFor(() => {
            expect(screen.getByText('Failed to save lobby')).toBeInTheDocument();
        });
    });

    it('shows loading state while saving', async () => {
        const user = userEvent.setup();
        let resolve: () => void;
        const onSave = vi.fn().mockReturnValue(new Promise<void>(r => { resolve = r; }));
        render(<LobbyModal lobby={makeLobby()} onSave={onSave} onClose={vi.fn()} />);

        await user.click(screen.getByRole('button', { name: /save changes/i }));

        expect(await screen.findByText('Saving...')).toBeInTheDocument();
        resolve!();
    });

    it('changes status via select', async () => {
        const user = userEvent.setup();
        const onSave = vi.fn().mockResolvedValue(undefined);
        render(<LobbyModal lobby={makeLobby({ status: 'open' })} onSave={onSave} onClose={vi.fn()} />);

        await user.selectOptions(screen.getByDisplayValue('open'), 'completed');

        await user.click(screen.getByRole('button', { name: /save changes/i }));

        await waitFor(() => {
            expect(onSave).toHaveBeenCalledWith(
                expect.objectContaining({ status: 'completed' })
            );
        });
    });

    it('handles lobby without prizePool', () => {
        const lobby = makeLobby({ prizePool: undefined });
        render(<LobbyModal lobby={lobby} onSave={vi.fn()} onClose={vi.fn()} />);
        expect(screen.getByText('Edit Tournament')).toBeInTheDocument();
    });

    it('trims name before saving', async () => {
        const user = userEvent.setup();
        const onSave = vi.fn().mockResolvedValue(undefined);
        render(<LobbyModal lobby={makeLobby({ name: '  Spaced Name  ' })} onSave={onSave} onClose={vi.fn()} />);

        await user.click(screen.getByRole('button', { name: /save changes/i }));

        await waitFor(() => {
            expect(onSave).toHaveBeenCalledWith(
                expect.objectContaining({ name: 'Spaced Name' })
            );
        });
    });
});
