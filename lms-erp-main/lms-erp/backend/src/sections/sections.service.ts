import { Injectable, Inject } from '@nestjs/common';
import type { Pool } from 'mysql2/promise';
import { v4 as uuid } from 'uuid';
import { DB_POOL } from '../database/database.module';

@Injectable()
export class SectionsService {
  constructor(@Inject(DB_POOL) private db: Pool) {}

  async create(courseId: string, title: string) {
    const [[{ count }]] = (await this.db.query(
      'SELECT COUNT(*) AS count FROM sections WHERE course_id=?',
      [courseId],
    )) as any;
    const id = uuid();
    await this.db.query(
      'INSERT INTO sections (id,title,order_num,course_id) VALUES (?,?,?)',
      [id, title, Number(count) + 1, courseId],
    );
    const [[s]] = (await this.db.query('SELECT * FROM sections WHERE id=?', [
      id,
    ])) as any;
    return s;
  }

  async update(id: string, title: string) {
    await this.db.query('UPDATE sections SET title=? WHERE id=?', [title, id]);
    const [[s]] = (await this.db.query('SELECT * FROM sections WHERE id=?', [
      id,
    ])) as any;
    return s;
  }

  async remove(id: string) {
    await this.db.query('DELETE FROM sections WHERE id=?', [id]);
    return { message: 'Deleted' };
  }
}
