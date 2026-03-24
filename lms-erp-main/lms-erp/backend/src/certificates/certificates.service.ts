import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { Pool } from 'mysql2/promise';
import { DB_POOL } from '../database/database.module';

@Injectable()
export class CertificatesService {
  constructor(@Inject(DB_POOL) private db: Pool) {}

  async findMy(userId: string) {
    const [rows] = await this.db.query(`
      SELECT cert.*, c.title AS course_title, c.thumbnail,
             u.name AS user_name, u.employee_id, u.department, inst.name AS instructor_name
      FROM certificates cert JOIN courses c ON c.id=cert.course_id
      JOIN users u ON u.id=cert.user_id JOIN users inst ON inst.id=c.instructor_id
      WHERE cert.user_id=? ORDER BY cert.issued_at DESC
    `, [userId]) as any;
    return rows;
  }

  async verify(number: string) {
    const [[cert]] = await this.db.query(`
      SELECT cert.*, c.title AS course_title, u.name AS user_name, u.employee_id
      FROM certificates cert JOIN courses c ON c.id=cert.course_id JOIN users u ON u.id=cert.user_id
      WHERE cert.certificate_number=?
    `, [number]) as any;
    return { valid: !!cert, certificate: cert || null };
  }

  async findOne(id: string) {
    const [[cert]] = await this.db.query(`
      SELECT cert.*, c.title AS course_title, c.description AS course_description,
             u.name AS user_name, u.employee_id, u.department, inst.name AS instructor_name
      FROM certificates cert JOIN courses c ON c.id=cert.course_id
      JOIN users u ON u.id=cert.user_id JOIN users inst ON inst.id=c.instructor_id
      WHERE cert.id=?
    `, [id]) as any;
    if (!cert) throw new NotFoundException('Not found');
    return cert;
  }
}
