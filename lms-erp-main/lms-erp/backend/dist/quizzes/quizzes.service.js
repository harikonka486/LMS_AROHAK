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
exports.QuizzesService = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
const database_module_1 = require("../database/database.module");
const progress_service_1 = require("../progress/progress.service");
let QuizzesService = class QuizzesService {
    db;
    progress;
    constructor(db, progress) {
        this.db = db;
        this.progress = progress;
    }
    async findByCourse(courseId) {
        const [quizzes] = await this.db.query('SELECT * FROM quizzes WHERE course_id=? ORDER BY order_num', [courseId]);
        for (const q of quizzes) {
            const [questions] = await this.db.query('SELECT id,text,options FROM questions WHERE quiz_id=?', [q.id]);
            q.questions = questions.map((q) => ({ ...q, options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options }));
        }
        return quizzes;
    }
    async findOne(id, userRole) {
        const [[quiz]] = await this.db.query('SELECT * FROM quizzes WHERE id=?', [id]);
        if (!quiz)
            throw new common_1.NotFoundException('Not found');
        const fields = userRole === 'admin' ? 'id,text,options,correct_answer,explanation' : 'id,text,options';
        const [questions] = await this.db.query(`SELECT ${fields} FROM questions WHERE quiz_id=?`, [id]);
        quiz.questions = questions.map((q) => ({ ...q, options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options }));
        return quiz;
    }
    async create(courseId, body) {
        const { title, description, passing_score = 70, questions } = body;
        const conn = await this.db.getConnection();
        try {
            await conn.beginTransaction();
            const [[{ count }]] = await conn.query('SELECT COUNT(*) AS count FROM quizzes WHERE course_id=?', [courseId]);
            const qid = (0, uuid_1.v4)();
            await conn.query('INSERT INTO quizzes (id,course_id,title,description,passing_score,order_num) VALUES (?,?,?,?,?,?)', [qid, courseId, title, description || null, passing_score, Number(count) + 1]);
            for (const q of (questions || [])) {
                await conn.query('INSERT INTO questions (id,quiz_id,text,options,correct_answer,explanation) VALUES (?,?,?,?,?,?)', [(0, uuid_1.v4)(), qid, q.text, JSON.stringify(q.options), q.correctAnswer, q.explanation || null]);
            }
            await conn.commit();
            const [[quiz]] = await conn.query('SELECT * FROM quizzes WHERE id=?', [qid]);
            const [qs] = await conn.query('SELECT * FROM questions WHERE quiz_id=?', [qid]);
            quiz.questions = qs;
            return quiz;
        }
        catch (e) {
            await conn.rollback();
            throw e;
        }
        finally {
            conn.release();
        }
    }
    async submit(quizId, answers, userId) {
        const [[quiz]] = await this.db.query('SELECT * FROM quizzes WHERE id=?', [quizId]);
        if (!quiz)
            throw new common_1.NotFoundException('Quiz not found');
        const [questions] = await this.db.query('SELECT * FROM questions WHERE quiz_id=?', [quizId]);
        let correct = 0;
        const results = questions.map((q, i) => {
            const isCorrect = answers[i] === q.correct_answer;
            if (isCorrect)
                correct++;
            return { questionId: q.id, selected: answers[i], correct: q.correct_answer, isCorrect, explanation: q.explanation };
        });
        const score = questions.length > 0 ? (correct / questions.length) * 100 : 0;
        const passed = score >= quiz.passing_score;
        await this.db.query('INSERT INTO quiz_attempts (id,user_id,quiz_id,answers,score,passed) VALUES (?,?,?,?,?,?)', [(0, uuid_1.v4)(), userId, quizId, JSON.stringify(answers), score, passed ? 1 : 0]);
        if (passed) {
            const [[{ courseId }]] = await this.db.query('SELECT course_id AS courseId FROM quizzes WHERE id=?', [quizId]);
            const [[{ total }]] = await this.db.query('SELECT COUNT(*) AS total FROM quizzes WHERE course_id=?', [courseId]);
            const [[{ passedCount }]] = await this.db.query(`
        SELECT COUNT(DISTINCT qa.quiz_id) AS passedCount FROM quiz_attempts qa JOIN quizzes q ON q.id=qa.quiz_id
        WHERE qa.user_id=? AND q.course_id=? AND qa.passed=1
      `, [userId, courseId]);
            if (Number(passedCount) >= Number(total)) {
                const certNum = `CERT-${Date.now()}-${userId.slice(0, 8).toUpperCase()}`;
                await this.db.query('INSERT IGNORE INTO certificates (id,user_id,course_id,certificate_number) VALUES (?,?,?,?)', [(0, uuid_1.v4)(), userId, courseId, certNum]);
            }
            const [[enrollment]] = await this.db.query('SELECT id FROM enrollments WHERE user_id=? AND course_id=?', [userId, courseId]);
            if (enrollment)
                await this.progress.syncEnrollmentStatus(enrollment.id, userId, courseId);
        }
        return { score, passed, correct, total: questions.length, results, passingScore: quiz.passing_score };
    }
};
exports.QuizzesService = QuizzesService;
exports.QuizzesService = QuizzesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.DB_POOL)),
    __metadata("design:paramtypes", [Object, progress_service_1.ProgressService])
], QuizzesService);
//# sourceMappingURL=quizzes.service.js.map