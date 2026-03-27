import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { Pool } from 'mysql2/promise';
import { v4 as uuid } from 'uuid';
import { DB_POOL } from '../database/database.module';

@Injectable()
export class CoursesSimpleService {
  constructor(@Inject(DB_POOL) private db: Pool) {}

  async create(body: any, file: any, userId: string) {
    const { title, description, categoryId, level, passing_score } = body;
    if (!title || !description) throw new Error('Title and description are required');
    const thumbnail = file ? `/uploads/thumbnails/${file.filename}` : null;
    const id = uuid();
    await this.db.query(
      `INSERT INTO courses (id, title, description, thumbnail, instructor_id, category_id, level, passing_score) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, title, description, thumbnail, userId, categoryId || null, level || 'beginner', passing_score || 70]
    );
    const [course]: any = await this.db.query('SELECT * FROM courses WHERE id = ?', [id]);
    return course[0];
  }

  async findOne(id: string) {
    const [course]: any = await this.db.query('SELECT * FROM courses WHERE id = ?', [id]);
    if (!course[0]) throw new NotFoundException('Course not found');
    return course[0];
  }
}
