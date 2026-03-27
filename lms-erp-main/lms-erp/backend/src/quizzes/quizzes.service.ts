import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { Pool } from 'mysql2/promise';
import { v4 as uuid } from 'uuid';
import { DB_POOL } from '../database/database.module';
import { ProgressService } from '../progress/progress.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class QuizzesService {
  constructor(
    @Inject(DB_POOL) private db: Pool,
    private progress: ProgressService,
    private mail: MailService,
  ) {}

  async findByCourse(courseId: string) {
    const [quizzes] = (await this.db.query(
      'SELECT * FROM quizzes WHERE course_id=? ORDER BY order_num',
      [courseId],
    )) as any;
    for (const q of quizzes) {
      const [questions] = (await this.db.query(
        'SELECT id,text,options FROM questions WHERE quiz_id=?',
        [q.id],
      )) as any;
      q.questions = questions.map((q: any) => ({
        ...q,
        options:
          typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
      }));
    }
    return quizzes;
  }

  async findOne(id: string, userRole: string) {
    const [[quiz]] = (await this.db.query('SELECT * FROM quizzes WHERE id=?', [
      id,
    ])) as any;
    if (!quiz) throw new NotFoundException('Not found');
    const fields =
      userRole === 'admin'
        ? 'id,text,options,correct_answer,explanation'
        : 'id,text,options';
    const [questions] = (await this.db.query(
      `SELECT ${fields} FROM questions WHERE quiz_id=?`,
      [id],
    )) as any;
    quiz.questions = questions.map((q: any) => ({
      ...q,
      options:
        typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
    }));
    return quiz;
  }

  async create(courseId: string, body: any) {
    const { title, description, passing_score = 70, questions } = body;
    const conn = await (this.db as any).getConnection();
    try {
      await conn.beginTransaction();
      const [[{ count }]] = await conn.query(
        'SELECT COUNT(*) AS count FROM quizzes WHERE course_id=?',
        [courseId],
      );
      const qid = uuid();
      await conn.query(
        'INSERT INTO quizzes (id,course_id,title,description,passing_score,order_num) VALUES (?,?,?,?,?,?)',
        [
          qid,
          courseId,
          title,
          description || null,
          passing_score,
          Number(count) + 1,
        ],
      );
      for (const q of questions || []) {
        await conn.query(
          'INSERT INTO questions (id,quiz_id,text,options,correct_answer,explanation) VALUES (?,?,?,?,?,?)',
          [
            uuid(),
            qid,
            q.text,
            JSON.stringify(q.options),
            q.correctAnswer,
            q.explanation || null,
          ],
        );
      }
      await conn.commit();
      const [[quiz]] = await conn.query('SELECT * FROM quizzes WHERE id=?', [
        qid,
      ]);
      const [qs] = await conn.query('SELECT * FROM questions WHERE quiz_id=?', [
        qid,
      ]);
      quiz.questions = qs;
      return quiz;
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  }

  async submit(quizId: string, answers: number[], userId: string) {
    const [[quiz]] = (await this.db.query('SELECT * FROM quizzes WHERE id=?', [
      quizId,
    ])) as any;
    if (!quiz) throw new NotFoundException('Quiz not found');
    const [questions] = (await this.db.query(
      'SELECT * FROM questions WHERE quiz_id=?',
      [quizId],
    )) as any;
    let correct = 0;
    const results = questions.map((q: any, i: number) => {
      const isCorrect = answers[i] === q.correct_answer;
      if (isCorrect) correct++;
      return {
        questionId: q.id,
        selected: answers[i],
        correct: q.correct_answer,
        isCorrect,
        explanation: q.explanation,
      };
    });
    const score = questions.length > 0 ? (correct / questions.length) * 100 : 0;
    const passed = score >= quiz.passing_score;
    await this.db.query(
      'INSERT INTO quiz_attempts (id,user_id,quiz_id,answers,score,passed) VALUES (?,?,?,?,?,?)',
      [uuid(), userId, quizId, JSON.stringify(answers), score, passed ? 1 : 0],
    );
    if (passed) {
      const [[{ courseId }]] = (await this.db.query(
        'SELECT course_id AS courseId FROM quizzes WHERE id=?',
        [quizId],
      )) as any;
      const [[{ total }]] = (await this.db.query(
        'SELECT COUNT(*) AS total FROM quizzes WHERE course_id=?',
        [courseId],
      )) as any;
      const [[{ passedCount }]] = (await this.db.query(
        `
        SELECT COUNT(DISTINCT qa.quiz_id) AS passedCount FROM quiz_attempts qa JOIN quizzes q ON q.id=qa.quiz_id
        WHERE qa.user_id=? AND q.course_id=? AND qa.passed=1
      `,
        [userId, courseId],
      )) as any;
      if (Number(passedCount) >= Number(total)) {
        const certNum = `CERT-${Date.now()}-${userId.slice(0, 8).toUpperCase()}`;
        await this.db.query(
          'INSERT IGNORE INTO certificates (id,user_id,course_id,certificate_number,score) VALUES (?,?,?,?,?)',
          [uuid(), userId, courseId, certNum, Math.round(score * 100) / 100],
        );
        // Send certificate email to the user
        const [[user]] = (await this.db.query(
          'SELECT name, email, employee_id, department FROM users WHERE id=?',
          [userId],
        )) as any;
        const [[course]] = (await this.db.query(
          'SELECT c.title, u.name AS instructor_name FROM courses c JOIN users u ON u.id=c.instructor_id WHERE c.id=?',
          [courseId],
        )) as any;
        const [[cert]] = (await this.db.query(
          'SELECT issued_at FROM certificates WHERE certificate_number=?',
          [certNum],
        )) as any;
        if (user && course) {
          // Certificate email disabled — users view certificates in the portal
        }
      }
      const [[enrollment]] = (await this.db.query(
        'SELECT id FROM enrollments WHERE user_id=? AND course_id=?',
        [userId, courseId],
      )) as any;
      if (enrollment)
        await this.progress.syncEnrollmentStatus(
          enrollment.id,
          userId,
          courseId,
        );
    }
    return {
      score,
      passed,
      correct,
      total: questions.length,
      results,
      passingScore: quiz.passing_score,
    };
  }
}
