import { render, screen } from '@testing-library/react';
import ErrorBoundary from '../../components/common/ErrorBoundary';

function ThrowError({ shouldThrow }: { shouldThrow: boolean }) {
    if (shouldThrow) throw new Error('Test error');
    return <p>No error here</p>;
}

describe('ErrorBoundary', () => {
    beforeEach(() => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('renders children when there is no error', () => {
        render(
            <ErrorBoundary>
                <ThrowError shouldThrow={false} />
            </ErrorBoundary>
        );
        expect(screen.getByText('No error here')).toBeInTheDocument();
    });

    it('renders the fallback when a child throws', () => {
        render(
            <ErrorBoundary fallback={<p>Something went wrong</p>}>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        );
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('renders nothing (null) when there is no fallback and a child throws', () => {
        const { container } = render(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        );
        expect(container).toBeEmptyDOMElement();
    });

    it('calls the onError callback when a child throws', () => {
        const onError = vi.fn();
        render(
            <ErrorBoundary onError={onError}>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        );
        expect(onError).toHaveBeenCalledTimes(1);
    });

    it('does not call onError when there is no error', () => {
        const onError = vi.fn();
        render(
            <ErrorBoundary onError={onError}>
                <ThrowError shouldThrow={false} />
            </ErrorBoundary>
        );
        expect(onError).not.toHaveBeenCalled();
    });
});
