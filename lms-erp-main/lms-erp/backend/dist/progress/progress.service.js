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
exports.ProgressService = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
const database_module_1 = require("../database/database.module");
let ProgressService = class ProgressService {
    db;
    constructor(db) {
        this.db = db;
    }
    async syncEnrollmentStatus(enrollmentId, userId, courseId) {
        const [[{ totalLessons }]] = (await this.db.query('SELECT COUNT(*) AS totalLessons FROM lessons l JOIN sections s ON s.id=l.section_id WHERE s.course_id=?', [courseId]));
        const [[{ doneLessons }]] = (await this.db.query('SELECT COUNT(*) AS doneLessons FROM lesson_progress WHERE enrollment_id=? AND completed=1', [enrollmentId]));
        const [[{ totalQuizzes }]] = (await this.db.query('SELECT COUNT(*) AS totalQuizzes FROM quizzes WHERE course_id=?', [courseId]));
        const [[{ passedQuizzes }]] = (await this.db.query(`
      SELECT COUNT(DISTINCT qa.quiz_id) AS passedQuizzes
      FROM quiz_attempts qa JOIN quizzes q ON q.id=qa.quiz_id
      WHERE qa.user_id=? AND q.course_id=? AND qa.passed=1
    `, [userId, courseId]));
        const lessonsComplete = Number(totalLessons) === 0 ||
            Number(doneLessons) >= Number(totalLessons);
        const quizzesComplete = Number(totalQuizzes) === 0 ||
            Number(passedQuizzes) >= Number(totalQuizzes);
        if (lessonsComplete && quizzesComplete) {
            await this.db.query("UPDATE enrollments SET status='completed', completed_at=COALESCE(completed_at, NOW()) WHERE id=?", [enrollmentId]);
        }
        return { totalLessons, doneLessons, totalQuizzes, passedQuizzes };
    }
    async completeLesson(lessonId, userId) {
        const [[lesson]] = (await this.db.query('SELECT l.*, s.course_id FROM lessons l JOIN sections s ON s.id=l.section_id WHERE l.id=?', [lessonId]));
        if (!lesson)
            throw new common_1.NotFoundException('Lesson not found');
        const [[enrollment]] = (await this.db.query('SELECT * FROM enrollments WHERE user_id=? AND course_id=?', [userId, lesson.course_id]));
        if (!enrollment)
            throw new common_1.ForbiddenException('Not enrolled');
        await this.db.query(`
      INSERT INTO lesson_progress (id,enrollment_id,lesson_id,completed,completed_at) VALUES (?,?,?,1,NOW())
      ON DUPLICATE KEY UPDATE completed=1, completed_at=NOW()
    `, [(0, uuid_1.v4)(), enrollment.id, lessonId]);
        const stats = await this.syncEnrollmentStatus(enrollment.id, userId, lesson.course_id);
        return {
            completed: true,
            totalLessons: stats.totalLessons,
            completedLessons: stats.doneLessons,
        };
    }
    async getCourseProgress(courseId, userId) {
        const [[enrollment]] = (await this.db.query('SELECT * FROM enrollments WHERE user_id=? AND course_id=?', [userId, courseId]));
        if (!enrollment)
            return { enrolled: false };
        const [[{ total }]] = (await this.db.query('SELECT COUNT(*) AS total FROM lessons l JOIN sections s ON s.id=l.section_id WHERE s.course_id=?', [courseId]));
        const [progress] = (await this.db.query('SELECT * FROM lesson_progress WHERE enrollment_id=?', [enrollment.id]));
        const completed = progress.filter((p) => p.completed).length;
        await this.syncEnrollmentStatus(enrollment.id, userId, courseId);
        const [[fresh]] = (await this.db.query('SELECT * FROM enrollments WHERE id=?', [enrollment.id]));
        return {
            enrolled: true,
            progress,
            completedLessons: completed,
            totalLessons: Number(total),
            percentage: total > 0 ? Math.round((completed / Number(total)) * 100) : 0,
            completedAt: fresh.completed_at,
            status: fresh.status,
        };
    }
};
exports.ProgressService = ProgressService;
exports.ProgressService = ProgressService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.DB_POOL)),
    __metadata("design:paramtypes", [Object])
], ProgressService);
//# sourceMappingURL=progress.service.js.map