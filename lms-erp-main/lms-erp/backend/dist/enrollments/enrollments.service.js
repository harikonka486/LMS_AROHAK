"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnrollmentsService = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
const database_module_1 = require("../database/database.module");
let EnrollmentsService = class EnrollmentsService {
    db;
    constructor(db) {
        this.db = db;
    }
    async findAll() {
        const [rows] = (await this.db.query(`SELECT e.id AS enrollment_id, e.enrolled_at, e.completed_at, e.status,
              u.name AS user_name, u.email AS user_email, u.employee_id, u.department,
              COALESCE(c.title, e.course_title_snapshot, 'Course Deleted') AS course_title,
              COALESCE(c.level, 'N/A') AS level,
              CASE WHEN c.id IS NOT NULL THEN
                (SELECT COUNT(*) FROM lessons l JOIN sections s ON s.id=l.section_id WHERE s.course_id=c.id)
              ELSE 0 END AS total_lessons,
              (SELECT COUNT(*) FROM lesson_progress lp WHERE lp.enrollment_id=e.id AND lp.completed=1) AS completed_lessons
       FROM enrollments e
       JOIN users u ON u.id = e.user_id
       LEFT JOIN courses c ON c.id = e.course_id
       WHERE e.id = (
         SELECT e2.id FROM enrollments e2
         WHERE e2.user_id = e.user_id AND e2.course_id = e.course_id
         ORDER BY FIELD(e2.status,'completed','active','dropped'), e2.enrolled_at DESC
         LIMIT 1
       )
       ORDER BY e.enrolled_at DESC`));
        return rows;
    }
    async enroll(userId, courseId) {
        const [[course]] = (await this.db.query('SELECT * FROM courses WHERE id=?', [courseId]));
        if (!course)
            throw new common_1.NotFoundException('Course not found');
        const [[existing]] = (await this.db.query('SELECT id FROM enrollments WHERE user_id=? AND course_id=?', [userId, courseId]));
        if (existing)
            throw new common_1.BadRequestException('Already enrolled');
        const id = (0, uuid_1.v4)();
        await this.db.query('INSERT INTO enrollments (id,user_id,course_id,course_title_snapshot) VALUES (?,?,?,?)', [id, userId, courseId, course.title]);
        const [[enrollment]] = (await this.db.query('SELECT * FROM enrollments WHERE id=?', [id]));
        return enrollment;
    }
    async findMy(userId) {
        const [rows] = (await this.db.query(`
      SELECT e.*, c.title AS course_title, c.thumbnail, c.level, c.passing_score,
             u.name AS instructor_name,
             (SELECT COUNT(*) FROM lessons l JOIN sections s ON s.id=l.section_id WHERE s.course_id=c.id) AS total_lessons,
             (SELECT COUNT(*) FROM lesson_progress lp WHERE lp.enrollment_id=e.id AND lp.completed=1) AS completed_lessons,
             (SELECT COUNT(*) FROM quizzes WHERE course_id=c.id) AS total_quizzes,
             (SELECT COUNT(DISTINCT qa.quiz_id) FROM quiz_attempts qa JOIN quizzes q ON q.id=qa.quiz_id
              WHERE qa.user_id=e.user_id AND q.course_id=c.id AND qa.passed=1) AS passed_quizzes
      FROM enrollments e JOIN courses c ON c.id=e.course_id JOIN users u ON u.id=c.instructor_id
      WHERE e.user_id=? ORDER BY e.enrolled_at DESC
    `, [userId]));
        return rows;
    }
    async unenroll(enrollmentId) {
        const [[enrollment]] = (await this.db.query('SELECT id, user_id, course_id FROM enrollments WHERE id=?', [enrollmentId]));
        if (!enrollment)
            throw new common_1.NotFoundException('Enrollment not found');
        await this.db.query('DELETE FROM enrollments WHERE id=?', [enrollmentId]);
        return { message: 'Unenrolled successfully.' };
    }
    async check(userId, courseId) {
        const [[enrollment]] = (await this.db.query('SELECT * FROM enrollments WHERE user_id=? AND course_id=?', [userId, courseId]));
        return { enrolled: !!enrollment, enrollment: enrollment || null };
    }
};
exports.EnrollmentsService = EnrollmentsService;
exports.EnrollmentsService = EnrollmentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.DB_POOL)),
    __metadata("design:paramtypes", [Object])
], EnrollmentsService);
//# sourceMappingURL=enrollments.service.js.map