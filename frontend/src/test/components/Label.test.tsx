import { render, screen } from '@testing-library/react';
import Label from '../../components/common/Label';

describe('Label', () => {

    it('renders the text passed as children', () => {
        render(<Label>Email address</Label>);
        expect(screen.getByText('Email address')).toBeInTheDocument();
    });

    it('has the correct htmlFor attribute pointing to the input', () => {
        render(<Label htmlFor="email">Email address</Label>);
        const label = screen.getByText('Email address');
        expect(label).toHaveAttribute('for', 'email');
    });

    it('renders a <label> element in the DOM', () => {
        render(<Label>Password</Label>);
        const label = screen.getByText('Password');
        expect(label.tagName).toBe('LABEL');
    });

});
