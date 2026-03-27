import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import type { Pool } from 'mysql2/promise';
import { DB_POOL } from '../database/database.module';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DB_POOL) private db: Pool,
    private jwt: JwtService,
    private mail: MailService,
  ) {}

  private sign(id: string) {
    return this.jwt.sign({ id });
  }

  async register(body: any) {
    const { name, email, password, role, department, employee_id } = body;

    const [exists] = (await this.db.query(
      'SELECT id FROM users WHERE email=?',
      [email],
    )) as any;
    if (exists.length) throw new BadRequestException('Email already in use');

    const hashed = await bcrypt.hash(password, 10);
    const id = uuid();
    const userRole = role === 'admin' ? 'admin' : 'employee';
    await this.db.query(
      'INSERT INTO users (id,name,email,password,role,department,employee_id) VALUES (?,?,?,?,?,?,?)',
      [id, name, email, hashed, userRole, department || null, employee_id || null],
    );
    const [[user]] = (await this.db.query(
      'SELECT id,name,email,role,avatar,department,employee_id,created_at FROM users WHERE id=?',
      [id],
    )) as any;

    // Generate email verification token (expires in 24h)
    const verifyToken = uuid();
    await this.db.query(
      'INSERT INTO email_verification_tokens (id, user_id, token, expires_at) VALUES (?,?,?, DATE_ADD(NOW(), INTERVAL 24 HOUR))',
      [uuid(), id, verifyToken],
    );

    // Send welcome email with verify button (non-blocking)
    this.mail.sendWelcome(email, name, verifyToken);

    return { token: this.sign(id), user };
  }

  async verifyEmail(token: string) {
    const [[record]] = (await this.db.query(
      'SELECT * FROM email_verification_tokens WHERE token=?',
      [token],
    )) as any;

    // Token not found at all
    if (!record) throw new BadRequestException('Invalid verification link');

    // Already verified — check if user is verified
    if (record.used) {
      const [[user]] = (await this.db.query(
        'SELECT is_email_verified FROM users WHERE id=?',
        [record.user_id],
      )) as any;
      if (user?.is_email_verified) {
        return { message: 'Email already verified!' };
      }
      throw new BadRequestException('This verification link has already been used');
    }

    // Expired
    const [[valid]] = (await this.db.query(
      'SELECT id FROM email_verification_tokens WHERE token=? AND used=0 AND expires_at > NOW()',
      [token],
    )) as any;
    if (!valid) throw new BadRequestException('Verification link has expired');

    await this.db.query('UPDATE users SET is_email_verified=1 WHERE id=?', [record.user_id]);
    await this.db.query('UPDATE email_verification_tokens SET used=1 WHERE id=?', [record.id]);

    return { message: 'Email verified successfully!' };
  }

  async login(body: any) {
    const { email, password } = body;

    const [[user]] = (await this.db.query('SELECT * FROM users WHERE email=?', [
      email,
    ])) as any;
    if (!user || !(await bcrypt.compare(password, user.password)))
      throw new UnauthorizedException('Invalid credentials');

    if (!user.is_email_verified) {
      throw new UnauthorizedException('Please verify your email address before logging in. Check your inbox for the verification link.');
    }

    const { password: _, ...userData } = user;
    return { token: this.sign(user.id), user: userData };
  }

  async forgotPassword(email: string) {
    const [[user]] = (await this.db.query(
      'SELECT id, name FROM users WHERE email=?',
      [email],
    )) as any;
    if (!user)
      return { message: 'If that email exists, a reset link has been sent.' };

    // Invalidate existing tokens
    await this.db.query(
      'UPDATE password_reset_tokens SET used=1 WHERE user_id=?',
      [user.id],
    );

    const token = uuid();
    await this.db.query(
      'INSERT INTO password_reset_tokens (id, user_id, token, expires_at) VALUES (?,?,?, DATE_ADD(NOW(), INTERVAL 1 HOUR))',
      [uuid(), user.id, token],
    );

    this.mail.sendPasswordReset(email, user.name, token);
    return { message: 'If that email exists, a reset link has been sent.' };
  }

  async resetPassword(token: string, newPassword: string) {
    const [[record]] = (await this.db.query(
      'SELECT * FROM password_reset_tokens WHERE token=? AND used=0 AND expires_at > NOW()',
      [token],
    )) as any;
    if (!record) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.db.query('UPDATE users SET password=? WHERE id=?', [
      hashed,
      record.user_id,
    ]);
    await this.db.query('UPDATE password_reset_tokens SET used=1 WHERE id=?', [
      record.id,
    ]);

    return { message: 'Password reset successfully. You can now log in.' };
  }
}
