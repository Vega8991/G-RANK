import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from '../../components/common/Button';

describe('Button', () => {

    it('renders the text passed as children', () => {
        render(<Button>Sign in</Button>);
        const button = screen.getByText('Sign in');
        expect(button).toBeInTheDocument();
    });

    it('calls the onClick handler when clicked', async () => {
        const handleClick = vi.fn();
        render(<Button onClick={handleClick}>Click here</Button>);
        const button = screen.getByText('Click here');

        await userEvent.click(button);
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('is disabled when the disabled prop is passed', () => {
        render(<Button disabled>Submit</Button>);
        const button = screen.getByRole('button', { name: 'Submit' });
        expect(button).toBeDisabled();
    });

});
