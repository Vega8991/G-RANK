import { render, screen } from '@testing-library/react';
import Spinner from '../../components/common/Spinner';

describe('Spinner', () => {
    it('renders without crashing', () => {
        const { container } = render(<Spinner />);
        expect(container.firstChild).toBeInTheDocument();
    });

    it('renders a spinning element', () => {
        const { container } = render(<Spinner />);
        const spinner = container.querySelector('.animate-spin');
        expect(spinner).toBeInTheDocument();
    });
});
