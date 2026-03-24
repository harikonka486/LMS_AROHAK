import { Injectable, Inject } from '@nestjs/common';
import type { Pool } from 'mysql2/promise';
import { DB_POOL } from '../database/database.module';

@Injectable()
export class CategoriesService {
  constructor(@Inject(DB_POOL) private db: Pool) {}

  async findAll() {
    const [rows] = await this.db.query(`
      SELECT c.*, COUNT(co.id) AS course_count
      FROM categories c LEFT JOIN courses co ON co.category_id=c.id
      GROUP BY c.id ORDER BY c.name
    `) as any;
    return rows;
  }
}
