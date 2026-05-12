import { prefetchRoute } from '../../services/routePrefetch';

describe('routePrefetch', () => {

    it('can prefetch a route without throwing', () => {
        expect(() => prefetchRoute('login')).not.toThrow();
    });

    it('returns early when prefetching same route again', () => {
        prefetchRoute('register');
        expect(() => prefetchRoute('register')).not.toThrow();
    });

});
