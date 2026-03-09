import { cn } from '../../lib/utils';

describe('cn', () => {

    it('merges multiple class names into a single string', () => {
        const result = cn('text-white', 'bg-red-500', 'rounded-md');
        expect(result).toBe('text-white bg-red-500 rounded-md');
    });

    it('resolves Tailwind conflicts by keeping the last class', () => {
        const result = cn('text-red-500', 'text-blue-500');
        expect(result).toBe('text-blue-500');
    });

});
