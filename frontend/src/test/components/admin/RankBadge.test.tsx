import { render, screen } from '@testing-library/react';
import RankBadge from '../../../components/admin/RankBadge';

describe('RankBadge', () => {
    it('renders the rank text', () => {
        render(<RankBadge rank="Gold" />);
        expect(screen.getByText('Gold')).toBeInTheDocument();
    });

    it('renders for Bronze rank', () => {
        render(<RankBadge rank="Bronze" />);
        expect(screen.getByText('Bronze')).toBeInTheDocument();
    });

    it('renders for Silver rank', () => {
        render(<RankBadge rank="Silver" />);
        expect(screen.getByText('Silver')).toBeInTheDocument();
    });

    it('renders for Platinum rank', () => {
        render(<RankBadge rank="Platinum" />);
        expect(screen.getByText('Platinum')).toBeInTheDocument();
    });

    it('renders for Diamond rank', () => {
        render(<RankBadge rank="Diamond" />);
        expect(screen.getByText('Diamond')).toBeInTheDocument();
    });

    it('renders for unknown rank without crashing', () => {
        render(<RankBadge rank="Unknown" />);
        expect(screen.getByText('Unknown')).toBeInTheDocument();
    });
});
