import { Injectable, BadRequestException, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import type { Pool } from 'mysql2/promise';
import { DB_POOL } from '../database/database.module';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DB_POOL) private db: Pool,
    private jwt: JwtService,
  ) {}

  private sign(id: string) {
    return this.jwt.sign({ id });
  }

  async register(body: any) {
    const { name, email, password, role, department, employee_id } = body;
    if (!email?.endsWith('@arohak.com'))
      throw new BadRequestException('Only @arohak.com email addresses are allowed');

    const [exists] = await this.db.query('SELECT id FROM users WHERE email=?', [email]) as any;
    if (exists.length) throw new BadRequestException('Email already in use');

    const hashed = await bcrypt.hash(password, 10);
    const id = uuid();
    const userRole = role === 'admin' ? 'admin' : 'employee';
    await this.db.query(
      'INSERT INTO users (id,name,email,password,role,department,employee_id) VALUES (?,?,?,?,?,?,?)',
      [id, name, email, hashed, userRole, department || null, employee_id || null],
    );
    const [[user]] = await this.db.query(
      'SELECT id,name,email,role,avatar,department,employee_id,created_at FROM users WHERE id=?', [id],
    ) as any;
    return { token: this.sign(id), user };
  }

  async login(body: any) {
    const { email, password } = body;
    if (!email?.endsWith('@arohak.com'))
      throw new BadRequestException('Only @arohak.com email addresses are allowed');

    const [[user]] = await this.db.query('SELECT * FROM users WHERE email=?', [email]) as any;
    if (!user || !(await bcrypt.compare(password, user.password)))
      throw new UnauthorizedException('Invalid credentials');

    const { password: _, ...userData } = user;
    return { token: this.sign(user.id), user: userData };
  }
}
