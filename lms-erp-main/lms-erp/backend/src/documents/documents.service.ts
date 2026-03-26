import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import type { Pool } from 'mysql2/promise';
import { v4 as uuid } from 'uuid';
import { DB_POOL } from '../database/database.module';

@Injectable()
export class DocumentsService {
  constructor(@Inject(DB_POOL) private db: Pool) {}

  async upload(courseId: string, body: any, file: any, user: any) {
    // Verify user has access to the course
    const [[course]] = (await this.db.query(
      'SELECT * FROM courses WHERE id=?',
      [courseId],
    )) as any;
    
    if (!course) throw new NotFoundException('Course not found');
    if (course.instructor_id !== user.id && user.role !== 'admin')
      throw new ForbiddenException('Not authorized to upload to this course');

    const { title } = body;
    const file_url = file ? `/uploads/documents/${file.filename}` : null;
    const file_type = file ? file.mimetype : null;
    const file_size = file ? file.size : null;
    
    const id = uuid();
    
    // Get current order number
    const [[{ max_order }]] = (await this.db.query(
      'SELECT COALESCE(MAX(order_num), 0) as max_order FROM course_documents WHERE course_id=?',
      [courseId],
    )) as any;

    await this.db.query(
      'INSERT INTO course_documents (id, course_id, title, file_url, file_type, file_size, order_num) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        id,
        courseId,
        title || file?.originalname || 'Document',
        file_url,
        file_type,
        file_size,
        max_order + 1,
      ],
    );

    const [[document]] = (await this.db.query(
      'SELECT * FROM course_documents WHERE id=?',
      [id],
    )) as any;

    return document;
  }

  async findByCourse(courseId: string) {
    const [documents] = (await this.db.query(
      'SELECT * FROM course_documents WHERE course_id=? ORDER BY order_num',
      [courseId],
    )) as any;
    return documents;
  }

  async delete(id: string, user: any) {
    const [[document]] = (await this.db.query(
      'SELECT d.*, c.instructor_id FROM course_documents d JOIN courses c ON d.course_id = c.id WHERE d.id=?',
      [id],
    )) as any;

    if (!document) throw new NotFoundException('Document not found');
    if (document.instructor_id !== user.id && user.role !== 'admin')
      throw new ForbiddenException('Not authorized to delete this document');

    await this.db.query('DELETE FROM course_documents WHERE id=?', [id]);
    return { message: 'Document deleted successfully' };
  }
}
