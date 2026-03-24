import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { Pool } from 'mysql2/promise';
import { v4 as uuid } from 'uuid';
import { DB_POOL } from '../database/database.module';

@Injectable()
export class LessonsService {
  constructor(@Inject(DB_POOL) private db: Pool) {}

  async findOne(id: string) {
    const [[lesson]] = await this.db.query('SELECT * FROM lessons WHERE id=?', [id]) as any;
    if (!lesson) throw new NotFoundException('Not found');
    return lesson;
  }

  async create(sectionId: string, body: any, file: any) {
    const [[{ count }]] = await this.db.query('SELECT COUNT(*) AS count FROM lessons WHERE section_id=?', [sectionId]) as any;
    const { title, description, video_url, duration, is_free } = body;
    const video_file = file ? `/uploads/videos/${file.filename}` : null;
    const id = uuid();
    await this.db.query(
      'INSERT INTO lessons (id,title,description,video_url,video_file,duration,is_free,order_num,section_id) VALUES (?,?,?,?,?,?,?,?,?)',
      [id, title, description || null, video_url || null, video_file, duration || null, is_free ? 1 : 0, Number(count) + 1, sectionId],
    );
    const [[lesson]] = await this.db.query('SELECT * FROM lessons WHERE id=?', [id]) as any;
    return lesson;
  }

  async update(id: string, body: any, file: any) {
    const { title, description, video_url, duration, is_free } = body;
    const video_file = file ? `/uploads/videos/${file.filename}` : undefined;
    const fields = ['title=?', 'description=?', 'video_url=?', 'duration=?', 'is_free=?'];
    const vals: any[] = [title, description, video_url, duration, is_free ? 1 : 0];
    if (video_file) { fields.push('video_file=?'); vals.push(video_file); }
    vals.push(id);
    await this.db.query(`UPDATE lessons SET ${fields.join(',')} WHERE id=?`, vals);
    const [[lesson]] = await this.db.query('SELECT * FROM lessons WHERE id=?', [id]) as any;
    return lesson;
  }

  async remove(id: string) {
    await this.db.query('DELETE FROM lessons WHERE id=?', [id]);
    return { message: 'Deleted' };
  }
}
