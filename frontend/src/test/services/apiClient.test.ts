import axios from 'axios';
import { AUTH_CHANGE_EVENT } from '../../constants/events';

vi.mock('axios', () => {
    const interceptors = {
        response: {
            use: vi.fn(),
        },
    };
    const instance = {
        interceptors,
    };
    return {
        default: {
            create: vi.fn(() => instance),
        },
        __esModule: true,
    };
});

describe('apiClient', () => {
    it('creates an axios instance with withCredentials: true', async () => {
        await import('../../services/apiClient');

        expect(axios.create).toHaveBeenCalledWith(
            expect.objectContaining({ withCredentials: true })
        );
    });

    it('registers a response interceptor', async () => {
        const mockedAxios = vi.mocked(axios);
        const instance = mockedAxios.create();

        expect(instance.interceptors.response.use).toHaveBeenCalled();
    });

    it('the error handler dispatches AUTH_CHANGE_EVENT on 401', async () => {
        const mockedAxios = vi.mocked(axios);
        const instance = mockedAxios.create();
        const useCall = vi.mocked(instance.interceptors.response.use);

        const errorHandler = useCall.mock.calls[0]?.[1] as (err: unknown) => unknown;
        if (!errorHandler) return;

        const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
        const error = { response: { status: 401 } };

        await expect(errorHandler(error)).rejects.toEqual(error);

        expect(dispatchSpy).toHaveBeenCalledWith(
            expect.objectContaining({ type: AUTH_CHANGE_EVENT })
        );

        dispatchSpy.mockRestore();
    });

    it('the error handler does NOT dispatch AUTH_CHANGE_EVENT on non-401 errors', async () => {
        const mockedAxios = vi.mocked(axios);
        const instance = mockedAxios.create();
        const useCall = vi.mocked(instance.interceptors.response.use);

        const errorHandler = useCall.mock.calls[0]?.[1] as (err: unknown) => unknown;
        if (!errorHandler) return;

        const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
        const error = { response: { status: 500 } };

        await expect(errorHandler(error)).rejects.toEqual(error);

        expect(dispatchSpy).not.toHaveBeenCalled();

        dispatchSpy.mockRestore();
    });
});
