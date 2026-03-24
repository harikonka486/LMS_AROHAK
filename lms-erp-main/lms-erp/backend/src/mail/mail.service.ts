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
    try {
      await this.transporter.sendMail({
        from: `"LMS Training Portal" <${from}>`,
        to,
        subject: 'Welcome to LMS Training Portal',
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9fafb;padding:32px;border-radius:12px;">
            <div style="background:linear-gradient(135deg,#1e1b4b,#4f46e5);padding:32px;border-radius:10px;text-align:center;margin-bottom:24px;">
              <h1 style="color:#fff;margin:0;font-size:28px;">Welcome to LMS!</h1>
              <p style="color:rgba(255,255,255,0.75);margin:8px 0 0;">Your learning journey starts now</p>
            </div>
            <p style="color:#374151;font-size:16px;">Hi <strong>${name}</strong>,</p>
            <p style="color:#6b7280;font-size:15px;line-height:1.6;">
              Your account has been successfully created on the <strong>LMS Training Portal</strong>.
              You can now browse courses, track your progress, and earn certificates.
            </p>
            <div style="text-align:center;margin:32px 0;">
              <a href="${this.config.get('FRONTEND_URL', 'http://localhost:3000')}/login"
                style="background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">
                Go to Dashboard
              </a>
            </div>
            <p style="color:#9ca3af;font-size:13px;text-align:center;margin-top:24px;">
              © ${new Date().getFullYear()} Arohak Technologies. All rights reserved.
            </p>
          </div>
        `,
      });
      this.logger.log(`Welcome email sent to ${to}`);
    } catch (err) {
      this.logger.error(`Failed to send welcome email to ${to}: ${err.message}`);
    }
  }
}
