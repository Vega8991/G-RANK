// Suppress expected console noise from error-path tests and module-level warnings.
// Some modules (e.g. riotService) emit console.warn at import time when env vars are
// absent; the per-test beforeEach fires too late for those. Suppress immediately here
// (setupFilesAfterEnv runs before each test file is evaluated) and re-apply per test.

jest.spyOn(console, 'error').mockImplementation(() => {});
jest.spyOn(console, 'warn').mockImplementation(() => {});

beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
    jest.restoreAllMocks();
});
