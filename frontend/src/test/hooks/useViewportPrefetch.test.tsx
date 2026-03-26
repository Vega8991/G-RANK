import { render } from '@testing-library/react';
import { useViewportPrefetch } from '../../hooks/useViewportPrefetch';
import { prefetchRoute } from '../../services/routePrefetch';

vi.mock('../../services/routePrefetch', () => ({
    prefetchRoute: vi.fn()
}));

class MockIntersectionObserver {
    callback: IntersectionObserverCallback;
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();

    constructor(callback: IntersectionObserverCallback) {
        this.callback = callback;
        lastObserverInstance = this;
    }
}

let lastObserverInstance: MockIntersectionObserver | null = null;

function HookComponent() {
    const setRef = useViewportPrefetch('login');
    return <a href="#" ref={setRef}>Login</a>;
}

describe('useViewportPrefetch', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        lastObserverInstance = null;
        vi.stubGlobal('IntersectionObserver', MockIntersectionObserver as unknown as typeof IntersectionObserver);
    });

    it('creates observer and observes element', () => {
        render(<HookComponent />);
        expect((globalThis.IntersectionObserver as unknown as typeof MockIntersectionObserver)).toBeDefined();
    });

    it('calls prefetchRoute when element intersects', () => {
        render(<HookComponent />);

        lastObserverInstance?.callback(
            [{ isIntersecting: true, target: document.createElement('a') } as IntersectionObserverEntry],
            lastObserverInstance as unknown as IntersectionObserver
        );

        expect(prefetchRoute).toHaveBeenCalled();
    });

});
