import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get('MAIL_HOST', 'smtp.gmail.com'),
      port: Number(this.config.get('MAIL_PORT', '587')),
      secure: false,
      auth: {
        user: this.config.get('MAIL_USER'),
        pass: this.config.get('MAIL_PASS'),
      },
    });
  }

  async onModuleInit() {
    const user = this.config.get('MAIL_USER');
    const pass = this.config.get('MAIL_PASS');
    if (
      !user ||
      user === 'your-email@gmail.com' ||
      !pass ||
      pass === 'your-app-password'
    ) {
      this.logger.warn(
        '⚠️  MAIL_USER / MAIL_PASS not configured in .env — emails will NOT be sent',
      );
      return;
    }
    try {
      await this.transporter.verify();
      this.logger.log(`✅ Mail transporter ready — sending from ${user}`);
    } catch (err) {
      this.logger.error(`❌ Mail transporter failed: ${err.message}`);
      this.logger.error(
        'Check MAIL_USER, MAIL_PASS in .env. For Gmail use an App Password (not your login password).',
      );
    }
  }

  async sendContact(name: string, email: string, phone: string, message: string): Promise<void> {
    const user = this.config.get('MAIL_USER');
    const pass = this.config.get('MAIL_PASS');
    if (!user || user === 'your-email@gmail.com' || !pass || pass === 'your-app-password') {
      this.logger.warn('Skipping contact email — SMTP not configured');
      return;
    }
    const from = this.config.get('MAIL_FROM', `LMS Platform <${user}>`);
    await this.transporter.sendMail({
      from,
      to: 'harigopal.konka@arohak.com',
      replyTo: email,
      subject: `Contact Form: Message from ${name}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#fff;border:1px solid #f0d9c8;border-radius:12px;">
          <h2 style="color:#8B1A1A;margin:0 0 20px;">New Contact Form Submission</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;width:120px;">Name</td><td style="padding:8px 0;font-size:14px;font-weight:600;color:#111;">${name}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Email</td><td style="padding:8px 0;font-size:14px;color:#111;"><a href="mailto:${email}" style="color:#8B1A1A;">${email}</a></td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Phone</td><td style="padding:8px 0;font-size:14px;color:#111;">${phone || '—'}</td></tr>
          </table>
          <div style="margin-top:20px;padding:16px;background:#FFF8F0;border-radius:8px;border:1px solid #f0d9c8;">
            <p style="color:#6b7280;font-size:13px;margin:0 0 6px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Message</p>
            <p style="color:#374151;font-size:14px;line-height:1.7;margin:0;">${message}</p>
          </div>
          <p style="color:#9ca3af;font-size:12px;margin-top:24px;">Sent from Arohak LMS Contact Form</p>
        </div>
      `,
    });
    this.logger.log(`Contact form email sent from ${email}`);
  }

  async sendWelcome(to: string, name: string, verifyToken?: string): Promise<void> {
    const user = this.config.get('MAIL_USER');
    const pass = this.config.get('MAIL_PASS');
    if (
      !user ||
      user === 'your-email@gmail.com' ||
      !pass ||
      pass === 'your-app-password'
    ) {
      this.logger.warn(`Skipping welcome email to ${to} — SMTP not configured`);
      return;
    }
    const from = this.config.get('MAIL_FROM', `LMS Platform <${user}>`);
    const frontendUrl = this.config.get('FRONTEND_URL', 'http://localhost:3000');
    const verifyUrl = verifyToken
      ? `${frontendUrl}/verify-email?token=${verifyToken}`
      : null;
    const dashboardUrl = `${frontendUrl}/dashboard`;

    const htmlContent = `<!DOCTYPE html>
<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Welcome to LMS Portal</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#FDF3E7;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FDF3E7;">
  <tr><td align="center" style="padding:40px 16px;">

    <table width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;background-color:#ffffff;border-radius:12px;border:1px solid #f0d9c8;">

      <!-- Header -->
      <tr>
        <td style="background-color:#8B1A1A;border-radius:12px 12px 0 0;padding:36px 32px;text-align:center;">
          <h1 style="margin:0 0 6px 0;font-size:24px;font-weight:800;color:#ffffff;">Welcome to LMS Portal!</h1>
          <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.65);">Your learning journey starts now</p>
          <table width="80" cellpadding="0" cellspacing="0" border="0" style="margin:16px auto 0;">
            <tr><td style="background-color:#D4A017;height:3px;border-radius:2px;"></td></tr>
          </table>
        </td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="padding:32px;">
          <p style="margin:0 0 8px 0;font-size:16px;font-weight:600;color:#3d0a0a;">Hi ${name},</p>
          <p style="margin:0 0 20px 0;font-size:14px;line-height:1.7;color:#6b7280;">
            Your account has been successfully created on <strong style="color:#8B1A1A;">LMS Portal</strong>.
            You now have access to structured courses, progress tracking, and verified certificates.
          </p>

          <!-- What you can do box -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FFF8F0;border-radius:10px;border:1px solid #f0d9c8;margin-bottom:24px;">
            <tr><td style="padding:20px;">
              <p style="margin:0 0 12px 0;font-size:12px;font-weight:700;color:#8B1A1A;text-transform:uppercase;letter-spacing:1px;">What you can do</p>
              <p style="margin:0 0 8px 0;font-size:13px;color:#374151;">&#128218; Browse and enroll in courses</p>
              <p style="margin:0 0 8px 0;font-size:13px;color:#374151;">&#128202; Track your learning progress</p>
              <p style="margin:0 0 8px 0;font-size:13px;color:#374151;">&#127942; Earn Verified certificates</p>
              <p style="margin:0;font-size:13px;color:#374151;">&#127919; Take quizzes and assessments</p>
            </td></tr>
          </table>

          ${verifyUrl ? `
          <!-- Verify Email box -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#fff8f0;border-radius:10px;border:1px solid #f0d9c8;margin-bottom:8px;">
            <tr><td style="padding:20px;">
              <p style="margin:0 0 6px 0;font-size:12px;font-weight:700;color:#8B1A1A;text-transform:uppercase;letter-spacing:1px;">Confirm your email address</p>
              <p style="margin:0 0 20px 0;font-size:13px;color:#6b7280;line-height:1.6;">Click the button below to confirm your email. This link expires in 24 hours.</p>
              <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
                <tr>
                  <td align="center" style="border-radius:8px;background-color:#8B1A1A;">
                    <!--[if mso]>
                    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${verifyUrl}" style="height:48px;v-text-anchor:middle;width:240px;" arcsize="10%" stroke="f" fillcolor="#8B1A1A">
                      <w:anchorlock/>
                      <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:15px;font-weight:bold;">Confirm Email Address</center>
                    </v:roundrect>
                    <![endif]-->
                    <!--[if !mso]><!-->
                    <a href="${verifyUrl}" style="display:inline-block;background-color:#8B1A1A;color:#ffffff;font-family:Arial,sans-serif;font-size:15px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:8px;mso-hide:all;">Confirm Email Address</a>
                    <!--<![endif]-->
                  </td>
                </tr>
              </table>
              <p style="margin:16px 0 0;font-size:11px;color:#9ca3af;text-align:center;">Or copy this link: <a href="${verifyUrl}" style="color:#8B1A1A;word-break:break-all;">${verifyUrl}</a></p>
            </td></tr>
          </table>
          ` : `
          <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
            <tr>
              <td align="center" style="border-radius:8px;background-color:#8B1A1A;">
                <a href="${dashboardUrl}" style="display:inline-block;background-color:#8B1A1A;color:#ffffff;font-family:Arial,sans-serif;font-size:15px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:8px;">Go to Dashboard</a>
              </td>
            </tr>
          </table>
          `}
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background-color:#FDF3E7;padding:20px 32px;text-align:center;border-top:1px solid #f0d9c8;border-radius:0 0 12px 12px;">
          <p style="margin:0;font-size:12px;color:#9ca3af;">
            &copy; ${new Date().getFullYear()} LMS Portal. All rights reserved.<br/>
            <span style="color:#c0a080;">This is an automated message &mdash; please do not reply.</span>
          </p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;

    try {
      await this.transporter.sendMail({
        from,
        to,
        subject: '🎉 Welcome to LMS Portal — Please confirm your email',
        html: htmlContent,
      });
      this.logger.log(`Welcome email sent to ${to}`);
    } catch (err) {
      this.logger.error(`Failed to send welcome email to ${to}: ${err.message}`);
    }
  }

  async sendCertificate(
    to: string,
    name: string,
    courseName: string,
    certNumber: string,
    verifyUrl: string,
    employeeId?: string,
    department?: string,
    instructorName?: string,
    issuedAt?: Date,
    score?: number,
  ): Promise<void> {
    const user = this.config.get('MAIL_USER');
    const pass = this.config.get('MAIL_PASS');
    if (
      !user ||
      user === 'your-email@gmail.com' ||
      !pass ||
      pass === 'your-app-password'
    ) {
      this.logger.warn(
        `Skipping certificate email to ${to} — SMTP not configured`,
      );
      return;
    }
    const from = this.config.get('MAIL_FROM', `LMS Platform <${user}>`);
    const dateStr = issuedAt
      ? issuedAt.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

    try {
      await this.transporter.sendMail({
        from,
        to,
        subject: `🏆 Your Certificate of Completion — ${courseName}`,
        html: `
          <!DOCTYPE html>
          <html>
          <body style="margin:0;padding:0;background:#FDF3E7;font-family:Arial,sans-serif;">
            <div style="max-width:620px;margin:40px auto;">

              <!-- Intro -->
              <div style="text-align:center;margin-bottom:24px;">
                <p style="color:#8B1A1A;font-size:15px;font-weight:600;margin:0;">Congratulations, ${name}! 🎉</p>
                <p style="color:#6b7280;font-size:13px;margin:6px 0 0;">Your certificate of completion is ready.</p>
              </div>

              <!-- Certificate Card -->
              <div style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(139,26,26,0.12);">

                <!-- Header band -->
                <div style="background:linear-gradient(135deg,#3d0a0a 0%,#8B1A1A 50%,#C0392B 100%);padding:36px 32px;text-align:center;">
                  <div style="font-size:48px;margin-bottom:8px;">🏅</div>
                  <p style="color:rgba(255,200,150,0.85);font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin:0 0 8px;">LMS Training Portal</p>
                  <h1 style="color:#ffffff;font-size:26px;font-weight:800;margin:0;">Certificate of Completion</h1>
                </div>

                <!-- Body -->
                <div style="padding:36px 40px;text-align:center;border-left:4px solid #8B1A1A;border-right:4px solid #8B1A1A;border-bottom:4px solid #8B1A1A;border-radius:0 0 12px 12px;">
                  <p style="color:#9ca3af;font-size:11px;letter-spacing:3px;text-transform:uppercase;margin:0 0 12px;">This certifies that</p>
                  <h2 style="color:#8B1A1A;font-size:32px;font-weight:800;margin:0 0 6px;">${name}</h2>
                  ${employeeId ? `<p style="color:#9ca3af;font-size:13px;margin:0 0 2px;">Employee ID: ${employeeId}</p>` : ''}
                  ${department ? `<p style="color:#9ca3af;font-size:13px;margin:0 0 20px;">${department}</p>` : '<div style="margin-bottom:20px;"></div>'}

                  <p style="color:#6b7280;font-size:14px;margin:0 0 8px;">has successfully completed</p>
                  <h3 style="color:#111827;font-size:20px;font-weight:700;margin:0 0 20px;">${courseName}</h3>

                  <div style="display:inline-block;background:#f0fdf4;border:1px solid #86efac;border-radius:20px;padding:6px 16px;margin-bottom:16px;">
                    <span style="color:#16a34a;font-size:13px;font-weight:600;">✓ All assessments passed</span>
                  </div>

                  ${
                    score !== undefined
                      ? `
                  <div style="margin-bottom:28px;">
                    <span style="display:inline-block;background:#FFF8F0;border:1px solid #f0d9c8;border-radius:20px;padding:6px 20px;">
                      <span style="color:#8B1A1A;font-size:14px;font-weight:700;">Final Score: ${Math.round(score)}%</span>
                    </span>
                  </div>`
                      : '<div style="margin-bottom:28px;"></div>'
                  }

                  <!-- Footer row -->
                  <div style="border-top:1px solid #e5e7eb;padding-top:20px;display:table;width:100%;">
                    <div style="display:table-cell;text-align:left;vertical-align:bottom;width:33%;">
                      <p style="color:#374151;font-size:13px;font-weight:600;margin:0;">${instructorName || 'Arohak LMS'}</p>
                      <p style="color:#9ca3af;font-size:12px;margin:2px 0 0;">Course Instructor</p>
                    </div>
                    <div style="display:table-cell;text-align:center;vertical-align:bottom;width:34%;">
                      <p style="color:#9ca3af;font-size:10px;font-family:monospace;margin:0;">${certNumber}</p>
                      <p style="color:#9ca3af;font-size:12px;margin:2px 0 0;">Certificate ID</p>
                    </div>
                    <div style="display:table-cell;text-align:right;vertical-align:bottom;width:33%;">
                      <p style="color:#374151;font-size:13px;font-weight:600;margin:0;">${dateStr}</p>
                      <p style="color:#9ca3af;font-size:12px;margin:2px 0 0;">Date Issued</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Footer -->
              <div style="text-align:center;margin-top:24px;">
                <p style="color:#9ca3af;font-size:12px;margin:0;">© ${new Date().getFullYear()} Arohak Technologies. All rights reserved.</p>
              </div>

            </div>
          </body>
          </html>
        `,
      });
      this.logger.log(
        `Certificate email sent to ${to} for course: ${courseName}`,
      );
    } catch (err) {
      this.logger.error(
        `Failed to send certificate email to ${to}: ${err.message}`,
      );
    }
  }

  async sendPasswordReset(
    to: string,
    name: string,
    resetToken: string,
  ): Promise<void> {
    const user = this.config.get('MAIL_USER');
    const pass = this.config.get('MAIL_PASS');
    if (
      !user ||
      user === 'your-email@gmail.com' ||
      !pass ||
      pass === 'your-app-password'
    ) {
      this.logger.warn(`Skipping reset email to ${to} — SMTP not configured`);
      return;
    }
    const from = this.config.get('MAIL_FROM', `LMS Platform <${user}>`);
    const resetUrl = `${this.config.get('FRONTEND_URL', 'http://localhost:3000')}/reset-password?token=${resetToken}`;
    try {
      await this.transporter.sendMail({
        from,
        to,
        subject: '🔐 Reset Your LMS Portal Password',
        html: `<!DOCTYPE html>
<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#FDF3E7;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FDF3E7;">
  <tr><td align="center" style="padding:40px 16px;">
    <table width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;background-color:#ffffff;border-radius:12px;border:1px solid #f0d9c8;">

      <!-- Header -->
      <tr>
        <td style="background-color:#8B1A1A;border-radius:12px 12px 0 0;padding:36px 32px;text-align:center;">
          <h1 style="margin:0 0 6px 0;font-size:22px;font-weight:800;color:#ffffff;">Password Reset</h1>
          <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.65);">LMS Portal</p>
          <table width="80" cellpadding="0" cellspacing="0" border="0" style="margin:16px auto 0;">
            <tr><td style="background-color:#D4A017;height:3px;border-radius:2px;"></td></tr>
          </table>
        </td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="padding:32px;">
          <p style="margin:0 0 8px 0;font-size:16px;font-weight:600;color:#3d0a0a;">Hi ${name},</p>
          <p style="margin:0 0 24px 0;font-size:14px;line-height:1.7;color:#6b7280;">
            We received a request to reset your password. Click the button below to set a new password.
            This link expires in <strong style="color:#8B1A1A;">1 hour</strong>.
          </p>

          <!-- Button -->
          <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 24px;">
            <tr>
              <td align="center" style="border-radius:8px;background-color:#8B1A1A;">
                <!--[if mso]>
                <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${resetUrl}" style="height:48px;v-text-anchor:middle;width:200px;" arcsize="10%" stroke="f" fillcolor="#8B1A1A">
                  <w:anchorlock/>
                  <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:15px;font-weight:bold;">Reset Password</center>
                </v:roundrect>
                <![endif]-->
                <!--[if !mso]><!-->
                <a href="${resetUrl}" style="display:inline-block;background-color:#8B1A1A;color:#ffffff;font-family:Arial,sans-serif;font-size:15px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:8px;mso-hide:all;">Reset Password →</a>
                <!--<![endif]-->
              </td>
            </tr>
          </table>

          <p style="font-size:12px;color:#6b7280;text-align:center;margin:0 0 8px 0;">
            Or copy this link: <a href="${resetUrl}" style="color:#8B1A1A;word-break:break-all;">${resetUrl}</a>
          </p>
          <p style="font-size:12px;color:#9ca3af;text-align:center;margin:16px 0 0 0;">
            If you didn't request this, you can safely ignore this email.
          </p>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background-color:#FDF3E7;padding:20px 32px;text-align:center;border-top:1px solid #f0d9c8;border-radius:0 0 12px 12px;">
          <p style="margin:0;font-size:12px;color:#9ca3af;">
            &copy; ${new Date().getFullYear()} LMS Portal. All rights reserved.
          </p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>`,
      });
      this.logger.log(`✅ Password reset email sent to ${to}`);
    } catch (err) {
      this.logger.error(`Failed to send reset email to ${to}: ${err.message}`);
    }
  }
}
