import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
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

  async sendWelcome(to: string, name: string): Promise<void> {
    const from = this.config.get('MAIL_FROM', this.config.get('MAIL_USER'));
    const loginUrl = `${this.config.get('FRONTEND_URL', 'http://localhost:3000')}/login`;
    try {
      await this.transporter.sendMail({
        from: `"Arohak LMS Portal" <${from}>`,
        to,
        subject: '🎉 Welcome to Arohak LMS Portal!',
        html: `
          <!DOCTYPE html>
          <html>
          <body style="margin:0;padding:0;background:#FDF3E7;font-family:Arial,sans-serif;">
            <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(139,26,26,0.10);border:1px solid #f0d9c8;">

              <!-- Header -->
              <div style="background:linear-gradient(135deg,#3d0a0a 0%,#8B1A1A 55%,#C0392B 100%);padding:40px 32px;text-align:center;">
                <div style="width:64px;height:64px;background:rgba(255,255,255,0.15);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;border:3px solid rgba(255,255,255,0.25);">
                  <span style="color:#fff;font-size:28px;font-weight:bold;">${name.charAt(0).toUpperCase()}</span>
                </div>
                <h1 style="color:#ffffff;margin:0 0 6px;font-size:24px;font-weight:800;">Welcome to Arohak LMS!</h1>
                <p style="color:rgba(255,255,255,0.65);margin:0;font-size:14px;">Your learning journey starts now</p>
                <!-- Gold accent line -->
                <div style="height:3px;background:linear-gradient(90deg,#D4A017,#F0A500);border-radius:2px;margin-top:20px;"></div>
              </div>

              <!-- Body -->
              <div style="padding:32px;">
                <p style="color:#3d0a0a;font-size:16px;font-weight:600;margin:0 0 8px;">Hi ${name},</p>
                <p style="color:#6b7280;font-size:14px;line-height:1.7;margin:0 0 20px;">
                  Your account has been successfully created on the <strong style="color:#8B1A1A;">Arohak LMS Portal</strong>.
                  You now have access to structured courses, progress tracking, and verified certificates.
                </p>

                <!-- Feature highlights -->
                <div style="background:#FFF8F0;border-radius:12px;padding:20px;margin-bottom:24px;border:1px solid #f0d9c8;">
                  <p style="color:#8B1A1A;font-size:13px;font-weight:700;margin:0 0 12px;text-transform:uppercase;letter-spacing:0.05em;">What you can do</p>
                  <table style="width:100%;border-collapse:collapse;">
                    <tr>
                      <td style="padding:6px 0;color:#374151;font-size:13px;">📚 &nbsp;Browse and enroll in courses</td>
                    </tr>
                    <tr>
                      <td style="padding:6px 0;color:#374151;font-size:13px;">📊 &nbsp;Track your learning progress</td>
                    </tr>
                    <tr>
                      <td style="padding:6px 0;color:#374151;font-size:13px;">🏆 &nbsp;Earn verified certificates</td>
                    </tr>
                    <tr>
                      <td style="padding:6px 0;color:#374151;font-size:13px;">🎯 &nbsp;Take quizzes and assessments</td>
                    </tr>
                  </table>
                </div>

                <!-- CTA Button -->
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
        `,
      });
      this.logger.log(`Welcome email sent to ${to}`);
    } catch (err) {
      this.logger.error(`Failed to send welcome email to ${to}: ${err.message}`);
    }
  }
}
