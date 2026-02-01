let nodemailer = require('nodemailer');

let emailUser = process.env.EMAIL_USER;
let emailPass = process.env.EMAIL_PASS;
let emailFrom = process.env.EMAIL_FROM;

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: emailUser,
        pass: emailPass
    }
});

function sendVerificationEmail(userEmail, userName, verificationToken) {
    let verificationLink = process.env.FRONTEND_URL + '/verify-email?token=' + verificationToken;

    let mailOptions = {
        from: emailFrom,
        to: userEmail,
        subject: 'G-Rank - Verifica tu email',
        html: '<div style="font-family: Arial; max-width: 600px; margin: 0 auto;">' +
            '<h2 style="color: #DC143C;">¡Bienvenido a G-Rank, ' + userName + '!</h2>' +
            '<p>Gracias por registrarte. Haz clic en el botón de abajo para verificar tu email:</p>' +
            '<a href="' + verificationLink + '" style="background-color: #DC143C; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">Verificar Email</a>' +
            '<p style="margin-top: 20px; color: #666;">Si no te registraste, ignora este email.</p>' +
            '<p style="color: #999;">Este enlace expira en 24 horas.</p>' +
            '</div>'
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log('Error sending verification email: ' + error.message);
        } else {
            console.log('Verification email sent: ' + info.response);
        }
    });
}

function sendPasswordResetEmail(userEmail, userName, resetToken) {
    let resetLink = process.env.FRONTEND_URL + '/reset-password?token=' + resetToken;

    let mailOptions = {
        from: emailFrom,
        to: userEmail,
        subject: 'G-Rank - Recuperar contraseña',
        html: '<div style="font-family: Arial; max-width: 600px; margin: 0 auto;">' +
            '<h2 style="color: #DC143C;">Hola ' + userName + '</h2>' +
            '<p>Solicitaste restablecer tu contraseña. Haz clic en el botón:</p>' +
            '<a href="' + resetLink + '" style="background-color: #DC143C; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">Cambiar Contraseña</a>' +
            '<p style="margin-top: 20px; color: #666;">Si no lo solicitaste, ignora este email.</p>' +
            '<p style="color: #999;">Este enlace expira en 1 hora.</p>' +
            '</div>'
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log('Error sending reset email: ' + error.message);
        } else {
            console.log('Reset email sent: ' + info.response);
        }
    });
}

module.exports = {
    sendVerificationEmail,
    sendPasswordResetEmail
};
