import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { Pool } from 'mysql2/promise';
import { v4 as uuid } from 'uuid';
import { DB_POOL } from '../database/database.module';

@Injectable()
export class CoursesSimpleService {
  constructor(@Inject(DB_POOL) private db: Pool) {}

  async create(body: any, file: any, userId: string) {
    // Extract only the fields we absolutely need
    const { title, description, categoryId, level, passing_score } = body;
    
    // Basic validation
    if (!title || !description) {
      throw new Error('Title and description are required');
    }
    
    const thumbnail = file ? `/uploads/thumbnails/${file.filename}` : null;
    const id = uuid();
    
    try {
      // Simple, reliable INSERT with only the fields we need
      await this.db.query(
        `INSERT INTO courses (id, title, description, thumbnail, instructor_id, category_id, level, passing_score) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, title, description, thumbnail, userId, categoryId || null, level || 'beginner', passing_score || 70]
      );
      
      // Return the created course
      const [[course]] = await this.db.query(
        'SELECT * FROM courses WHERE id = ?',
        [id]
      );
      
      return course[0];
    } catch (error) {
      console.error('Course creation error:', error);
      throw error;
    }
  }

  async findOne(id: string) {
    const [[course]] = await this.db.query(
      'SELECT * FROM courses WHERE id = ?',
      [id]
    ) as any;
    
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    
    return course;
  }

  async findAll(query: any) {
    let where = 'WHERE c.is_published = 1';
    const vals: any[] = [];
    
    if (query.search) {
      where += ' AND c.title LIKE ?';
      vals.push(`%${query.search}%`);
    }
    
    if (query.category) {
      where += ' AND c.category_id = ?';
      vals.push(query.category);
    }
    
    if (query.level) {
      where += ' AND c.level = ?';
      vals.push(query.level);
    }
    
    const [courses] = await this.db.query(
      `SELECT c.*, u.name AS instructor_name, cat.name AS category_name,
             (SELECT COUNT(*) FROM enrollments WHERE course_id=c.id) AS enrollment_count,
             (SELECT COUNT(*) FROM sections WHERE course_id=c.id) AS section_count,
             (SELECT COUNT(*) FROM quizzes WHERE course_id=c.id) AS quiz_count
      FROM courses c 
      JOIN users u ON u.id=c.instructor_id 
      LEFT JOIN categories cat ON cat.id=c.category_id 
      ${where} 
      ORDER BY c.created_at DESC 
      LIMIT ? OFFSET ?`,
      [...vals, Number(query.limit) || 12, (Number(query.page) - 1) * 12]
    );
    
    return courses[0] || [];
  }
}
