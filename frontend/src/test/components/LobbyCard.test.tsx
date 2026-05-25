import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LobbyCard, { type LobbyCardData } from '../../components/lobbies/LobbyCard';

vi.mock('framer-motion', () => ({
    motion: {
        article: ({ children, className }: { children: React.ReactNode; className?: string }) => (
            <article className={className}>{children}</article>
        ),
    },
}));

const baseLobby: LobbyCardData = {
    _id: 'lobby-1',
    name: 'Test Lobby',
    description: 'A test lobby for testing',
    status: 'open',
    currentParticipants: 3,
    maxParticipants: 8,
    createdByName: 'vega',
    prizePoolLabel: '$50',
    formattedMatchDate: '2026-12-01 18:00',
    game: 'pokemon_showdown',
};

function renderCard(overrides: Partial<LobbyCardData> = {}, extraProps: { isRegistered?: boolean; userRiotLinked?: boolean | null } = {}) {
    const lobby = { ...baseLobby, ...overrides };
    return render(
        <LobbyCard
            lobby={lobby}
            isRegistered={extraProps.isRegistered ?? false}
            userRiotLinked={extraProps.userRiotLinked ?? null}
            onRegister={vi.fn()}
            onLeave={vi.fn()}
            index={0}
        />
    );
}

describe('LobbyCard', () => {
    it('renders the lobby name and description', () => {
        renderCard();
        expect(screen.getByText('Test Lobby')).toBeInTheDocument();
        expect(screen.getByText('A test lobby for testing')).toBeInTheDocument();
    });

    it('shows the creator name', () => {
        renderCard();
        expect(screen.getByText('by vega')).toBeInTheDocument();
    });

    it('shows the match date', () => {
        renderCard();
        expect(screen.getByText('2026-12-01 18:00')).toBeInTheDocument();
    });

    it('shows the prize pool when there is one', () => {
        renderCard();
        expect(screen.getByText('$50')).toBeInTheDocument();
    });

    it('does not show prize pool when label is "No prize"', () => {
        renderCard({ prizePoolLabel: 'No prize' });
        expect(screen.queryByText('No prize')).not.toBeInTheDocument();
    });

    it('shows participant count', () => {
        renderCard();
        expect(screen.getByText('3/8 players')).toBeInTheDocument();
    });

    it('shows "Register now" button for an open lobby when not registered', () => {
        renderCard({ status: 'open' }, { isRegistered: false });
        expect(screen.getByRole('button', { name: 'Register now' })).toBeInTheDocument();
    });

    it('shows "Already registered" button when already registered', () => {
        renderCard({ status: 'open' }, { isRegistered: true });
        expect(screen.getByRole('button', { name: 'Already registered' })).toBeInTheDocument();
    });

    it('shows "Slots full" when the lobby is full', () => {
        renderCard({ currentParticipants: 8, maxParticipants: 8 });
        expect(screen.getByRole('button', { name: 'Slots full' })).toBeInTheDocument();
    });

    it('shows a "Leave" button when the user is registered and the lobby is open', () => {
        renderCard({ status: 'open' }, { isRegistered: true });
        expect(screen.getByRole('button', { name: /leave/i })).toBeInTheDocument();
    });

    it('does not show "Leave" when the user is not registered', () => {
        renderCard({ status: 'open' }, { isRegistered: false });
        expect(screen.queryByRole('button', { name: /leave/i })).not.toBeInTheDocument();
    });

    it('calls onRegister with the lobby id when the register button is clicked', async () => {
        const user = userEvent.setup();
        const onRegister = vi.fn();

        render(
            <LobbyCard
                lobby={baseLobby}
                isRegistered={false}
                userRiotLinked={null}
                onRegister={onRegister}
                onLeave={vi.fn()}
                index={0}
            />
        );

        await user.click(screen.getByRole('button', { name: 'Register now' }));
        expect(onRegister).toHaveBeenCalledWith('lobby-1');
    });

    it('calls onLeave with the lobby id when the leave button is clicked', async () => {
        const user = userEvent.setup();
        const onLeave = vi.fn();

        render(
            <LobbyCard
                lobby={baseLobby}
                isRegistered={true}
                userRiotLinked={null}
                onRegister={vi.fn()}
                onLeave={onLeave}
                index={0}
            />
        );

        await user.click(screen.getByRole('button', { name: /leave/i }));
        expect(onLeave).toHaveBeenCalledWith('lobby-1');
    });

    it('shows a Riot warning when the game needs Riot and user has not linked', () => {
        renderCard({ game: 'league_of_legends' }, { userRiotLinked: false });
        expect(screen.getByText(/requires a/i)).toBeInTheDocument();
    });

    it('shows a Riot success message when the game needs Riot and user has linked', () => {
        renderCard({ game: 'league_of_legends' }, { userRiotLinked: true });
        expect(screen.getByText(/riot account linked/i)).toBeInTheDocument();
    });

    it('shows "In progress" button when status is in_progress', () => {
        renderCard({ status: 'in_progress' });
        expect(screen.getByRole('button', { name: 'In progress' })).toBeInTheDocument();
    });

    it('shows "Cancelled" button when status is cancelled', () => {
        renderCard({ status: 'cancelled' });
        expect(screen.getByRole('button', { name: 'Cancelled' })).toBeInTheDocument();
    });
});
