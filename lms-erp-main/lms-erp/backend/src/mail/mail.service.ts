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

  async sendWelcome(to: string, name: string): Promise<void> {
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
    const loginUrl = `${this.config.get('FRONTEND_URL', 'http://localhost:3000')}/login`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Arohak LMS</title>
      </head>
      <body style="margin:0;padding:0;background:#FDF3E7;font-family:Arial,sans-serif;">
        <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(139,26,26,0.10);border:1px solid #f0d9c8;">
          <!-- Header -->
          <div style="background:linear-gradient(135deg,#3d0a0a 0%,#8B1A1A 55%,#C0392B 100%);padding:40px 32px;text-align:center;">
            <h1 style="color:#ffffff;margin:0 0 6px;font-size:26px;font-weight:800;letter-spacing:0.5px;">Welcome to Arohak LMS!</h1>
            <p style="color:rgba(255,255,255,0.65);margin:0;font-size:14px;">Your learning journey starts now</p>
            <div style="height:3px;background:linear-gradient(90deg,#D4A017,#F0A500);border-radius:2px;margin-top:20px;"></div>
          </div>
          <!-- Body -->
          <div style="padding:32px;">
            <p style="color:#3d0a0a;font-size:16px;font-weight:600;margin:0 0 8px;">Hi ${name},</p>
            <p style="color:#6b7280;font-size:14px;line-height:1.7;margin:0 0 20px;">
              Your account has been successfully created on <strong style="color:#8B1A1A;">Arohak LMS Portal</strong>.
              You now have access to structured courses, progress tracking, and verified certificates.
            </p>
            <div style="background:#FFF8F0;border-radius:12px;padding:20px;margin-bottom:24px;border:1px solid #f0d9c8;">
              <p style="color:#8B1A1A;font-size:13px;font-weight:700;margin:0 0 12px;text-transform:uppercase;letter-spacing:0.05em;">What you can do</p>
              <table style="width:100%;border-collapse:collapse;">
                <tr><td style="padding:6px 0;color:#374151;font-size:13px;">📚 Browse and enroll in courses</td></tr>
                <tr><td style="padding:6px 0;color:#374151;font-size:13px;">📊 Track your learning progress</td></tr>
                <tr><td style="padding:6px 0;color:#374151;font-size:13px;">🏆 Earn Verified certificates</td></tr>
                <tr><td style="padding:6px 0;color:#374151;font-size:13px;">🎯 Take quizzes and assessments</td></tr>
              </table>
            </div>
            <div style="text-align:center;margin:28px 0 8px;">
              <a href="${loginUrl}"
                style="display:inline-block;background:linear-gradient(135deg,#8B1A1A,#C0392B);color:#ffffff;padding:14px 36px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;letter-spacing:0.02em;">
                Go to Dashboard →
              </a>
            </div>
          </div>
          <!-- Footer -->
          <div style="background:#FDF3E7;padding:20px 32px;text-align:center;border-top:1px solid #f0d9c8;">
            <p style="color:#9ca3af;font-size:12px;margin:0;">
              © ${new Date().getFullYear()} Arohak Technologies. All rights reserved.<br/>
              <span style="color:#c0a080;">This is an automated message — please do not reply.</span>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await this.transporter.sendMail({
        from,
        to,
        subject: '🎉 Welcome to Arohak LMS Portal!',
        html: htmlContent,
      });
      this.logger.log(`Welcome email sent to ${to}`);
    } catch (err) {
      this.logger.error(
        `Failed to send welcome email to ${to}: ${err.message}`,
      );
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
        subject: '🔐 Reset Your Arohak LMS Password',
        html: `
          <!DOCTYPE html>
          <html>
          <body style="margin:0;padding:0;background:#FDF3E7;font-family:Arial,sans-serif;">
            <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(139,26,26,0.10);border:1px solid #f0d9c8;">
              <div style="background:linear-gradient(135deg,#3d0a0a 0%,#8B1A1A 55%,#C0392B 100%);padding:40px 32px;text-align:center;">
                <h1 style="color:#ffffff;margin:0 0 6px;font-size:24px;font-weight:800;">Password Reset</h1>
                <p style="color:rgba(255,255,255,0.65);margin:0;font-size:14px;">Arohak LMS Portal</p>
                <div style="height:3px;background:linear-gradient(90deg,#D4A017,#F0A500);border-radius:2px;margin-top:20px;"></div>
              </div>
              <div style="padding:32px;">
                <p style="color:#3d0a0a;font-size:16px;font-weight:600;margin:0 0 8px;">Hi ${name},</p>
                <p style="color:#6b7280;font-size:14px;line-height:1.7;margin:0 0 20px;">
                  We received a request to reset your password. Click the button below to set a new password.
                  This link expires in <strong style="color:#8B1A1A;">1 hour</strong>.
                </p>
                <div style="text-align:center;margin:28px 0;">
                  <a href="${resetUrl}"
                    style="display:inline-block;background:linear-gradient(135deg,#8B1A1A,#C0392B);color:#ffffff;padding:14px 36px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;">
                    Reset Password →
                  </a>
                </div>
                <p style="color:#6b7280;font-size:12px;text-align:center;margin:8px 0 0;">
                  Or copy this link: <a href="${resetUrl}" style="color:#8B1A1A;">${resetUrl}</a>
                </p>
                <p style="color:#9ca3af;font-size:12px;text-align:center;margin:16px 0 0;">
                  If you didn't request this, you can safely ignore this email.
                </p>
              </div>
              <div style="background:#FDF3E7;padding:20px 32px;text-align:center;border-top:1px solid #f0d9c8;">
                <p style="color:#9ca3af;font-size:12px;margin:0;">© ${new Date().getFullYear()} Arohak Technologies. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });
      this.logger.log(`✅ Password reset email sent to ${to}`);
    } catch (err) {
      this.logger.error(`Failed to send reset email to ${to}: ${err.message}`);
    }
  }
}
