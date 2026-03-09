import { render, screen } from '@testing-library/react';
import Card, { CardTitle, CardDescription, CardHeader, CardContent, CardFooter } from '../../components/common/Card';

describe('Card', () => {

    it('renders the content passed as children', () => {
        render(<Card>Card content</Card>);
        expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('CardTitle renders the title', () => {
        render(<CardTitle>My Tournament</CardTitle>);
        const title = screen.getByRole('heading', { name: 'My Tournament' });
        expect(title).toBeInTheDocument();
    });

    it('CardDescription renders the description', () => {
        render(<CardDescription>Tournament description</CardDescription>);
        expect(screen.getByText('Tournament description')).toBeInTheDocument();
    });

    it('CardHeader renders its content', () => {
        render(<CardHeader>Header</CardHeader>);
        expect(screen.getByText('Header')).toBeInTheDocument();
    });

    it('CardContent renders its content', () => {
        render(<CardContent>Card body</CardContent>);
        expect(screen.getByText('Card body')).toBeInTheDocument();
    });

    it('CardFooter renders its content', () => {
        render(<CardFooter>Card footer</CardFooter>);
        expect(screen.getByText('Card footer')).toBeInTheDocument();
    });

});
