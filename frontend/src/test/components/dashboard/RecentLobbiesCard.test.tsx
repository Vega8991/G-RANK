import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RecentLobbiesCard from '../../../components/dashboard/RecentLobbiesCard';
import type { Lobby } from '../../../types';

vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, className }: { children: React.ReactNode; className?: string }) => (
            <div className={className}>{children}</div>
        ),
    },
}));

const mockLobby: Lobby = {
    _id: 'l1',
    name: 'Summer Cup',
    description: 'A test tournament',
    game: 'league_of_legends',
    status: 'open',
    maxParticipants: 8,
    currentParticipants: 3,
    prizePool: '$100',
    registrationDeadline: '2026-06-01T00:00:00.000Z',
    matchDateTime: '2026-06-15T00:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
};

function renderCard(lobbies: Lobby[] = []) {
    return render(<MemoryRouter><RecentLobbiesCard lobbies={lobbies} /></MemoryRouter>);
}

describe('RecentLobbiesCard', () => {
    it('shows empty state when no lobbies', () => {
        renderCard([]);
        expect(screen.getByText('No lobbies yet')).toBeInTheDocument();
    });

    it('shows browse link when no lobbies', () => {
        renderCard([]);
        expect(screen.getByText(/Browse available lobbies/i)).toBeInTheDocument();
    });

    it('renders lobby name when lobbies are present', () => {
        renderCard([mockLobby]);
        expect(screen.getByText('Summer Cup')).toBeInTheDocument();
    });

    it('renders lobby status', () => {
        renderCard([mockLobby]);
        expect(screen.getByText('open')).toBeInTheDocument();
    });

    it('shows at most 4 lobbies', () => {
        const many = Array.from({ length: 6 }, (_, i) => ({
            ...mockLobby,
            _id: `l${i}`,
            name: `Lobby ${i}`,
        }));
        renderCard(many);
        const names = screen.getAllByText(/Lobby \d/);
        expect(names).toHaveLength(4);
    });

    it('renders the View all link', () => {
        renderCard([mockLobby]);
        expect(screen.getByRole('link', { name: /view all/i })).toBeInTheDocument();
    });
});
