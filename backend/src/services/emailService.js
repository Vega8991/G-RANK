const nodemailer = require('nodemailer');

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;
const emailFrom = process.env.EMAIL_FROM;

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: emailUser,
        pass: emailPass
    }
});

function emailWrapper(content) {
    return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>G-RANK</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;" bgcolor="#f3f4f6">

  <!-- Outer wrapper -->
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#f3f4f6" style="background-color:#f3f4f6;">
    <tr>
      <td align="center" style="padding:32px 16px 48px;">

        <!-- Card -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
               style="max-width:560px;width:100%;background-color:#ffffff;border-radius:16px;border:1px solid #e5e7eb;overflow:hidden;">

          <!-- Header bar -->
          <tr>
            <td bgcolor="#dc143c" style="background-color:#dc143c;padding:28px 36px 24px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="background-color:#ffffff;border-radius:8px;width:36px;height:36px;text-align:center;vertical-align:middle;" width="36" height="36">
                    <span style="color:#dc143c;font-size:18px;font-weight:900;line-height:36px;font-family:Georgia,serif;">&#9812;</span>
                  </td>
                  <td style="padding-left:10px;vertical-align:middle;">
                    <span style="color:#ffffff;font-size:20px;font-weight:900;letter-spacing:-0.3px;font-family:'Segoe UI',Arial,sans-serif;">G-RANK</span>
                  </td>
                </tr>
              </table>
              <p style="margin:12px 0 0;font-size:13px;color:rgba(255,255,255,0.75);font-family:'Segoe UI',Arial,sans-serif;letter-spacing:0.5px;">
                Competitive Esports Platform
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td bgcolor="#ffffff" style="background-color:#ffffff;padding:36px 36px 28px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td bgcolor="#f9fafb" style="background-color:#f9fafb;padding:20px 36px 24px;border-top:1px solid #e5e7eb;">
              <p style="margin:0 0 4px;font-size:12px;color:#6b7280;font-family:'Segoe UI',Arial,sans-serif;">
                © ${new Date().getFullYear()} G-RANK — All rights reserved.
              </p>
              <p style="margin:0;font-size:11px;color:#9ca3af;font-family:'Segoe UI',Arial,sans-serif;">
                If you didn't request this email, you can safely ignore it.
              </p>
            </td>
          </tr>

        </table>
        <!-- /Card -->

      </td>
    </tr>
  </table>

</body>
</html>`;
}

function ctaButton(href, label) {
    return `
<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:28px 0;">
  <tr>
    <td bgcolor="#dc143c" style="background-color:#dc143c;border-radius:10px;">
      <a href="${href}"
         target="_blank"
         style="display:inline-block;padding:15px 32px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:10px;font-family:'Segoe UI',Arial,sans-serif;letter-spacing:0.2px;">
        ${label}
      </a>
    </td>
  </tr>
</table>`;
}

function infoRow(icon, text) {
    return `
<tr>
  <td style="padding:5px 0;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td style="width:26px;vertical-align:top;padding-top:2px;font-size:13px;">${icon}</td>
        <td style="font-size:13px;color:#4b5563;line-height:1.6;font-family:'Segoe UI',Arial,sans-serif;">${text}</td>
      </tr>
    </table>
  </td>
</tr>`;
}

function securityBox(rows) {
    return `
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
       style="background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;margin-top:4px;">
  <tr>
    <td style="padding:18px 22px;">
      <p style="margin:0 0 10px;font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;font-family:'Segoe UI',Arial,sans-serif;">
        Security info
      </p>
      <table role="presentation" cellspacing="0" cellpadding="0" border="0">
        ${rows}
      </table>
    </td>
  </tr>
</table>`;
}

function fallbackLink(href) {
    return `
<p style="margin:0 0 24px;font-size:12px;color:#6b7280;font-family:'Segoe UI',Arial,sans-serif;">
  Button not working? Copy and paste this link into your browser:<br/>
  <a href="${href}" style="color:#dc143c;text-decoration:none;word-break:break-all;font-size:12px;">${href}</a>
</p>`;
}

function verificationEmailBody(userName, verificationLink) {
    const securityRows =
        infoRow('⏳', 'This link expires in <strong style="color:#1f2937;">24 hours</strong>.') +
        infoRow('🔒', 'It can only be used once. After that it will be invalidated.') +
        infoRow('🚫', "If you didn't create this account, you can safely ignore this email.");

    return `
<h1 style="margin:0 0 6px;font-size:24px;font-weight:900;color:#111827;letter-spacing:-0.3px;font-family:'Segoe UI',Arial,sans-serif;">
  Welcome, <span style="color:#dc143c;">${userName}</span>!
</h1>
<p style="margin:0 0 20px;font-size:12px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;font-family:'Segoe UI',Arial,sans-serif;">
  Account Verification
</p>
<p style="margin:0;font-size:15px;color:#374151;line-height:1.7;font-family:'Segoe UI',Arial,sans-serif;">
  Your <strong style="color:#111827;">G-RANK</strong> account has been created successfully.
  One last step — confirm your email address to unlock full access to tournaments, rankings and match stats.
</p>
${ctaButton(verificationLink, 'Verify my account →')}
${fallbackLink(verificationLink)}
${securityBox(securityRows)}`;
}

function resetPasswordEmailBody(userName, resetLink) {
    const securityRows =
        infoRow('⏳', 'This link expires in <strong style="color:#1f2937;">1 hour</strong>.') +
        infoRow('🔒', 'It can only be used once. After that it will be invalidated.') +
        infoRow('🚫', "If you didn't request this, ignore this email. Your current password remains valid.");

    return `
<h1 style="margin:0 0 6px;font-size:24px;font-weight:900;color:#111827;letter-spacing:-0.3px;font-family:'Segoe UI',Arial,sans-serif;">
  Hi, <span style="color:#dc143c;">${userName}</span>
</h1>
<p style="margin:0 0 20px;font-size:12px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;font-family:'Segoe UI',Arial,sans-serif;">
  Password Reset
</p>
<p style="margin:0;font-size:15px;color:#374151;line-height:1.7;font-family:'Segoe UI',Arial,sans-serif;">
  We received a request to reset the password for your <strong style="color:#111827;">G-RANK</strong> account.
  If that was you, click the button below to set a new password. If not, no action is required.
</p>
${ctaButton(resetLink, 'Reset my password →')}
${fallbackLink(resetLink)}
${securityBox(securityRows)}`;
}

function sendVerificationEmail(userEmail, userName, verificationToken) {
    const verificationLink = process.env.FRONTEND_URL + '/verify-email?token=' + verificationToken;

    const mailOptions = {
        from: emailFrom,
        to: userEmail,
        subject: 'G-RANK — Verify your account',
        html: emailWrapper(verificationEmailBody(userName, verificationLink))
    };

    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) reject(err);
            else resolve(info);
        });
    });
}

function sendPasswordResetEmail(userEmail, userName, resetToken) {
    const resetLink = process.env.FRONTEND_URL + '/reset-password?token=' + resetToken;

    const mailOptions = {
        from: emailFrom,
        to: userEmail,
        subject: 'G-RANK — Reset your password',
        html: emailWrapper(resetPasswordEmailBody(userName, resetLink))
    };

    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) reject(err);
            else resolve(info);
        });
    });
}

module.exports = {
    sendVerificationEmail,
    sendPasswordResetEmail
};
