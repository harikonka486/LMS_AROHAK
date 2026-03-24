import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import type { Pool } from 'mysql2/promise';
import { v4 as uuid } from 'uuid';
import { DB_POOL } from '../database/database.module';

@Injectable()
export class CoursesService {
  constructor(@Inject(DB_POOL) private db: Pool) {}

  async findAll(query: any) {
    const { search, category, level, page = 1, limit = 12 } = query;
    let where = 'WHERE c.is_published=1';
    const vals: any[] = [];
    if (search)   { where += ' AND c.title LIKE ?'; vals.push(`%${search}%`); }
    if (category) { where += ' AND c.category_id=?'; vals.push(category); }
    if (level)    { where += ' AND c.level=?'; vals.push(level); }
    const offset = (Number(page) - 1) * Number(limit);
    const [courses] = await this.db.query(`
      SELECT c.*, u.name AS instructor_name, cat.name AS category_name,
             (SELECT COUNT(*) FROM enrollments WHERE course_id=c.id) AS enrollment_count,
             (SELECT COUNT(*) FROM sections WHERE course_id=c.id) AS section_count,
             (SELECT COUNT(*) FROM quizzes WHERE course_id=c.id) AS quiz_count
      FROM courses c JOIN users u ON u.id=c.instructor_id
      LEFT JOIN categories cat ON cat.id=c.category_id
      ${where} ORDER BY c.created_at DESC LIMIT ? OFFSET ?
    `, [...vals, Number(limit), offset]) as any;
    const [[{ total }]] = await this.db.query(`SELECT COUNT(*) AS total FROM courses c ${where}`, vals) as any;
    return { courses, total, pages: Math.ceil(total / limit), page: Number(page) };
  }

  async findMy(userId: string) {
    const [rows] = await this.db.query(`
      SELECT c.*, cat.name AS category_name,
             (SELECT COUNT(*) FROM enrollments WHERE course_id=c.id) AS enrollment_count
      FROM courses c LEFT JOIN categories cat ON cat.id=c.category_id
      WHERE c.instructor_id=? ORDER BY c.created_at DESC
    `, [userId]) as any;
    return rows;
  }

  async findOne(id: string) {
    const [[course]] = await this.db.query(`
      SELECT c.*, u.name AS instructor_name, cat.name AS category_name,
             (SELECT COUNT(*) FROM enrollments WHERE course_id=c.id) AS enrollment_count
      FROM courses c JOIN users u ON u.id=c.instructor_id
      LEFT JOIN categories cat ON cat.id=c.category_id WHERE c.id=?
    `, [id]) as any;
    if (!course) throw new NotFoundException('Course not found');
    const [sections] = await this.db.query('SELECT * FROM sections WHERE course_id=? ORDER BY order_num', [id]) as any;
    for (const s of sections) {
      const [lessons] = await this.db.query('SELECT * FROM lessons WHERE section_id=? ORDER BY order_num', [s.id]) as any;
      s.lessons = lessons;
    }
    const [documents] = await this.db.query('SELECT * FROM course_documents WHERE course_id=? ORDER BY order_num', [id]) as any;
    const [quizzes] = await this.db.query('SELECT id,title,description,passing_score,order_num FROM quizzes WHERE course_id=? ORDER BY order_num', [id]) as any;
    return { ...course, sections, documents, quizzes };
  }

  async create(body: any, file: any, userId: string) {
    const { title, description, price = 0, level = 'beginner', language = 'English', categoryId, passing_score = 70, video_url } = body;
    const thumbnail = file ? `/uploads/thumbnails/${file.filename}` : null;
    const id = uuid();
    await this.db.query(
      'INSERT INTO courses (id,title,description,price,level,language,thumbnail,instructor_id,category_id,passing_score,video_url) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
      [id, title, description, price, level, language, thumbnail, userId, categoryId || null, passing_score, video_url || null],
    );
    const [[course]] = await this.db.query('SELECT * FROM courses WHERE id=?', [id]) as any;
    return course;
  }

  async update(id: string, body: any, file: any, user: any) {
    const [[course]] = await this.db.query('SELECT * FROM courses WHERE id=?', [id]) as any;
    if (!course) throw new NotFoundException('Not found');
    if (course.instructor_id !== user.id && user.role !== 'admin') throw new ForbiddenException();
    const thumbnail = file ? `/uploads/thumbnails/${file.filename}` : course.thumbnail;
    const { title, description, price, level, language, categoryId, passing_score, video_url } = body;
    await this.db.query(
      'UPDATE courses SET title=?,description=?,price=?,level=?,language=?,thumbnail=?,category_id=?,passing_score=?,video_url=?,updated_at=NOW() WHERE id=?',
      [title||course.title, description||course.description, price??course.price, level||course.level,
       language||course.language, thumbnail, categoryId||course.category_id, passing_score||course.passing_score,
       video_url !== undefined ? video_url : course.video_url, id],
    );
    const [[updated]] = await this.db.query('SELECT * FROM courses WHERE id=?', [id]) as any;
    return updated;
  }

  async togglePublish(id: string, user: any) {
    const [[course]] = await this.db.query('SELECT * FROM courses WHERE id=?', [id]) as any;
    if (!course) throw new NotFoundException('Not found');
    if (course.instructor_id !== user.id && user.role !== 'admin') throw new ForbiddenException();
    await this.db.query('UPDATE courses SET is_published=NOT is_published WHERE id=?', [id]);
    const [[updated]] = await this.db.query('SELECT * FROM courses WHERE id=?', [id]) as any;
    return updated;
  }

  async remove(id: string, user: any) {
    const [[course]] = await this.db.query('SELECT * FROM courses WHERE id=?', [id]) as any;
    if (!course) throw new NotFoundException('Not found');
    if (course.instructor_id !== user.id && user.role !== 'admin') throw new ForbiddenException();
    await this.db.query('DELETE FROM courses WHERE id=?', [id]);
    return { message: 'Deleted' };
  }
}
