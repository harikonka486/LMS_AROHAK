import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { Pool } from 'mysql2/promise';
import { DB_POOL } from '../database/database.module';

@Injectable()
export class CertificatesService {
  constructor(@Inject(DB_POOL) private db: Pool) {}

  async findAll() {
    const [rows] = (await this.db.query(
      `SELECT cert.*,
              COALESCE(c.title, cert.course_title_snapshot, 'Course Deleted') AS course_title,
              c.thumbnail,
              u.name AS user_name, u.email AS user_email,
              u.employee_id, u.department, u.role,
              inst.name AS instructor_name
       FROM certificates cert
       LEFT JOIN courses c ON c.id = cert.course_id
       JOIN users u ON u.id = cert.user_id
       LEFT JOIN users inst ON inst.id = c.instructor_id
       ORDER BY cert.issued_at DESC`,
    )) as any;

    // Deduplicate by user_id + course_id — one certificate per user per course
    const seen = new Map<string, any>();
    for (const cert of rows) {
      const key = `${cert.user_id}||${cert.course_id || cert.course_title_snapshot}`;
      if (!seen.has(key)) {
        seen.set(key, cert);
      }
    }
    return Array.from(seen.values());
  }

  async findMy(userId: string) {
    const [rows] = (await this.db.query(
      `SELECT cert.*,
              COALESCE(c.title, cert.course_title_snapshot, 'Course Deleted') AS course_title,
              c.thumbnail,
              u.name AS user_name, u.employee_id, u.department,
              inst.name AS instructor_name
       FROM certificates cert
       LEFT JOIN courses c ON c.id = cert.course_id
       JOIN users u ON u.id = cert.user_id
       LEFT JOIN users inst ON inst.id = c.instructor_id
       WHERE cert.user_id=? ORDER BY cert.issued_at DESC`,
      [userId],
    )) as any;

    // Deduplicate by course_id — keep only the latest certificate per course
    const seen = new Map<string, any>();
    for (const cert of rows) {
      const key = cert.course_id || cert.course_title_snapshot;
      if (!seen.has(key)) {
        seen.set(key, cert);
      }
    }
    return Array.from(seen.values());
  }

  async verify(number: string) {
    const [[cert]] = (await this.db.query(
      `SELECT cert.*,
              COALESCE(c.title, cert.course_title_snapshot, 'Course Deleted') AS course_title,
              u.name AS user_name, u.employee_id
       FROM certificates cert
       LEFT JOIN courses c ON c.id = cert.course_id
       JOIN users u ON u.id = cert.user_id
       WHERE cert.certificate_number=?`,
      [number],
    )) as any;
    return { valid: !!cert, certificate: cert || null };
  }

  async findOne(id: string) {
    const [[cert]] = (await this.db.query(
      `SELECT cert.*,
              COALESCE(c.title, cert.course_title_snapshot, 'Course Deleted') AS course_title,
              c.description AS course_description,
              u.name AS user_name, u.employee_id, u.department,
              inst.name AS instructor_name
       FROM certificates cert
       LEFT JOIN courses c ON c.id = cert.course_id
       JOIN users u ON u.id = cert.user_id
       LEFT JOIN users inst ON inst.id = c.instructor_id
       WHERE cert.id=?`,
      [id],
    )) as any;
    if (!cert) throw new NotFoundException('Not found');
    return cert;
  }

  async delete(id: string) {
    const [[cert]] = (await this.db.query(
      'SELECT id FROM certificates WHERE id=?',
      [id],
    )) as any;
    if (!cert) throw new NotFoundException('Certificate not found');
    await this.db.query('DELETE FROM certificates WHERE id=?', [id]);
    return { message: 'Certificate deleted successfully' };
  }
}
