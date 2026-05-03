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

// ─── Shared layout wrapper ────────────────────────────────────────────────────

function emailWrapper(content) {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>G-RANK</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:'Segoe UI',Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#0a0a0a;min-height:100vh;">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <!-- Card -->
        <table role="presentation" width="100%" style="max-width:580px;background-color:#111111;border-radius:20px;border:1px solid #2a2a2a;overflow:hidden;">

          <!-- Header stripe -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a0007 0%,#2d0010 50%,#1a0007 100%);padding:0;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding:32px 40px 28px;">
                    <!-- Logo row -->
                    <table role="presentation" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="background-color:#dc143c;border-radius:10px;width:40px;height:40px;text-align:center;vertical-align:middle;">
                          <span style="color:#ffffff;font-size:20px;font-weight:900;line-height:40px;">&#9813;</span>
                        </td>
                        <td style="padding-left:12px;vertical-align:middle;">
                          <span style="color:#ffffff;font-size:22px;font-weight:900;letter-spacing:-0.5px;">G-RANK</span>
                        </td>
                      </tr>
                    </table>
                    <!-- Divider -->
                    <div style="margin-top:24px;height:1px;background:linear-gradient(90deg,#dc143c55,#dc143c22,transparent);"></div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:0 40px 36px;">
              <div style="border-top:1px solid #222222;padding-top:24px;">
                <p style="margin:0 0 6px;font-size:12px;color:#4b5563;">
                  © ${new Date().getFullYear()} G-RANK — Competitive Esports Platform
                </p>
                <p style="margin:0;font-size:11px;color:#374151;">
                  If you didn't create this account, you can safely ignore this email.
                </p>
              </div>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── CTA button ───────────────────────────────────────────────────────────────

function ctaButton(href, label) {
    return `
<table role="presentation" cellspacing="0" cellpadding="0" style="margin:32px 0;">
  <tr>
    <td style="border-radius:12px;background-color:#dc143c;box-shadow:0 4px 24px rgba(220,20,60,0.35);">
      <a href="${href}"
         target="_blank"
         style="display:inline-block;padding:16px 36px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:12px;letter-spacing:0.3px;">
        ${label}
      </a>
    </td>
  </tr>
</table>`;
}

// ─── Info row (icon-like bullet) ──────────────────────────────────────────────

function infoRow(emoji, text) {
    return `
<tr>
  <td style="padding:6px 0;">
    <table role="presentation" cellspacing="0" cellpadding="0">
      <tr>
        <td style="width:28px;vertical-align:top;padding-top:1px;">
          <span style="font-size:14px;">${emoji}</span>
        </td>
        <td style="font-size:13px;color:#9ca3af;line-height:1.6;">${text}</td>
      </tr>
    </table>
  </td>
</tr>`;
}

// ─── Templates ────────────────────────────────────────────────────────────────

function verificationEmailBody(userName, verificationLink) {
    return `
<!-- Greeting -->
<h1 style="margin:0 0 8px;font-size:26px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">
  Welcome, <span style="color:#dc143c;">${userName}</span>!
</h1>
<p style="margin:0 0 4px;font-size:14px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:1px;">
  Account Verification
</p>

<!-- Body text -->
<p style="margin:24px 0 0;font-size:15px;color:#d1d5db;line-height:1.7;">
  Your <strong style="color:#ffffff;">G-RANK</strong> account has been created.
  One last step — confirm your email address to unlock full access to tournaments, rankings and stats.
</p>

${ctaButton(verificationLink, 'Verify my account →')}

<!-- Link fallback -->
<p style="margin:0 0 8px;font-size:12px;color:#6b7280;">
  Button not working? Copy and paste this link into your browser:
</p>
<p style="margin:0 0 32px;word-break:break-all;">
  <a href="${verificationLink}" style="font-size:12px;color:#dc143c;text-decoration:none;">${verificationLink}</a>
</p>

<!-- Info box -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0"
       style="background-color:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;margin-bottom:8px;">
  <tr><td style="padding:20px 24px;">
    <p style="margin:0 0 12px;font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">
      Security info
    </p>
    <table role="presentation" cellspacing="0" cellpadding="0">
      ${infoRow('⏳', 'This link expires in <strong style="color:#e5e7eb;">24 hours</strong>.')}
      ${infoRow('🔒', 'It can only be used once. After that it will be invalidated.')}
      ${infoRow('🚫', "If you didn't create this account, you can safely ignore this email.")}
    </table>
  </td></tr>
</table>`;
}

function resetPasswordEmailBody(userName, resetLink) {
    return `
<!-- Greeting -->
<h1 style="margin:0 0 8px;font-size:26px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">
  Hi, <span style="color:#dc143c;">${userName}</span>
</h1>
<p style="margin:0 0 4px;font-size:14px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:1px;">
  Password Reset
</p>

<!-- Body text -->
<p style="margin:24px 0 0;font-size:15px;color:#d1d5db;line-height:1.7;">
  We received a request to reset the password for your <strong style="color:#ffffff;">G-RANK</strong> account.
  If that was you, click the button below to set a new password.
</p>

${ctaButton(resetLink, 'Reset my password →')}

<!-- Link fallback -->
<p style="margin:0 0 8px;font-size:12px;color:#6b7280;">
  Button not working? Copy and paste this link into your browser:
</p>
<p style="margin:0 0 32px;word-break:break-all;">
  <a href="${resetLink}" style="font-size:12px;color:#dc143c;text-decoration:none;">${resetLink}</a>
</p>

<!-- Info box -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0"
       style="background-color:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;margin-bottom:8px;">
  <tr><td style="padding:20px 24px;">
    <p style="margin:0 0 12px;font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">
      Security info
    </p>
    <table role="presentation" cellspacing="0" cellpadding="0">
      ${infoRow('⏳', 'This link expires in <strong style="color:#e5e7eb;">1 hour</strong>.')}
      ${infoRow('🔒', 'It can only be used once. After that it will be invalidated.')}
      ${infoRow('🚫', "If you didn't request this, ignore this email. Your current password remains valid.")}
    </table>
  </td></tr>
</table>`;
}

// ─── Exports ──────────────────────────────────────────────────────────────────

function sendVerificationEmail(userEmail, userName, verificationToken) {
    let verificationLink = process.env.FRONTEND_URL + '/verify-email?token=' + verificationToken;

    let mailOptions = {
        from: emailFrom,
        to: userEmail,
        subject: 'G-RANK — Verify your account',
        html: emailWrapper(verificationEmailBody(userName, verificationLink))
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
        subject: 'G-RANK — Reset your password',
        html: emailWrapper(resetPasswordEmailBody(userName, resetLink))
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
