const mockSendMail = jest.fn();

jest.mock('nodemailer', () => ({
    createTransport: jest.fn(() => ({
        sendMail: mockSendMail
    }))
}));

const { sendVerificationEmail, sendPasswordResetEmail } = require('../../services/emailService');

describe('emailService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.FRONTEND_URL = 'http://localhost:5173';
    });

    test('sendVerificationEmail calls transporter with verification link', () => {
        sendVerificationEmail('user@test.com', 'Vega', 'token-123');

        expect(mockSendMail).toHaveBeenCalledTimes(1);
        const call = mockSendMail.mock.calls[0][0];
        expect(call.to).toBe('user@test.com');
        expect(call.subject).toContain('Verifica tu email');
        expect(call.html).toContain('/verify-email?token=token-123');
    });

    test('sendPasswordResetEmail calls transporter with reset link', () => {
        sendPasswordResetEmail('user@test.com', 'Vega', 'reset-456');

        expect(mockSendMail).toHaveBeenCalledTimes(1);
        const call = mockSendMail.mock.calls[0][0];
        expect(call.to).toBe('user@test.com');
        expect(call.subject).toContain('Recuperar contraseña');
        expect(call.html).toContain('/reset-password?token=reset-456');
    });
});
