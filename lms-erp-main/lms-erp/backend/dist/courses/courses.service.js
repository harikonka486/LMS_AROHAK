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
exports.CoursesService = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
const database_module_1 = require("../database/database.module");
let CoursesService = class CoursesService {
    db;
    constructor(db) {
        this.db = db;
    }
    async findAll(query) {
        const { search, category, level, page = 1, limit = 12 } = query;
        let where = 'WHERE c.is_published=1';
        const vals = [];
        if (search) {
            where += ' AND c.title LIKE ?';
            vals.push(`%${search}%`);
        }
        if (category) {
            where += ' AND c.category_id=?';
            vals.push(category);
        }
        if (level) {
            where += ' AND c.level=?';
            vals.push(level);
        }
        const offset = (Number(page) - 1) * Number(limit);
        const [courses] = await this.db.query(`
      SELECT c.*, u.name AS instructor_name, cat.name AS category_name,
             (SELECT COUNT(*) FROM enrollments WHERE course_id=c.id) AS enrollment_count,
             (SELECT COUNT(*) FROM sections WHERE course_id=c.id) AS section_count,
             (SELECT COUNT(*) FROM quizzes WHERE course_id=c.id) AS quiz_count
      FROM courses c JOIN users u ON u.id=c.instructor_id
      LEFT JOIN categories cat ON cat.id=c.category_id
      ${where} ORDER BY c.created_at DESC LIMIT ? OFFSET ?
    `, [...vals, Number(limit), offset]);
        const [[{ total }]] = await this.db.query(`SELECT COUNT(*) AS total FROM courses c ${where}`, vals);
        return { courses, total, pages: Math.ceil(total / limit), page: Number(page) };
    }
    async findMy(userId) {
        const [rows] = await this.db.query(`
      SELECT c.*, cat.name AS category_name,
             (SELECT COUNT(*) FROM enrollments WHERE course_id=c.id) AS enrollment_count
      FROM courses c LEFT JOIN categories cat ON cat.id=c.category_id
      WHERE c.instructor_id=? ORDER BY c.created_at DESC
    `, [userId]);
        return rows;
    }
    async findOne(id) {
        const [[course]] = await this.db.query(`
      SELECT c.*, u.name AS instructor_name, cat.name AS category_name,
             (SELECT COUNT(*) FROM enrollments WHERE course_id=c.id) AS enrollment_count
      FROM courses c JOIN users u ON u.id=c.instructor_id
      LEFT JOIN categories cat ON cat.id=c.category_id WHERE c.id=?
    `, [id]);
        if (!course)
            throw new common_1.NotFoundException('Course not found');
        const [sections] = await this.db.query('SELECT * FROM sections WHERE course_id=? ORDER BY order_num', [id]);
        for (const s of sections) {
            const [lessons] = await this.db.query('SELECT * FROM lessons WHERE section_id=? ORDER BY order_num', [s.id]);
            s.lessons = lessons;
        }
        const [documents] = await this.db.query('SELECT * FROM course_documents WHERE course_id=? ORDER BY order_num', [id]);
        const [quizzes] = await this.db.query('SELECT id,title,description,passing_score,order_num FROM quizzes WHERE course_id=? ORDER BY order_num', [id]);
        return { ...course, sections, documents, quizzes };
    }
    async create(body, file, userId) {
        const { title, description, price = 0, level = 'beginner', language = 'English', categoryId, passing_score = 70 } = body;
        const thumbnail = file ? `/uploads/thumbnails/${file.filename}` : null;
        const id = (0, uuid_1.v4)();
        await this.db.query('INSERT INTO courses (id,title,description,price,level,language,thumbnail,instructor_id,category_id,passing_score) VALUES (?,?,?,?,?,?,?,?,?,?)', [id, title, description, price, level, language, thumbnail, userId, categoryId || null, passing_score]);
        const [[course]] = await this.db.query('SELECT * FROM courses WHERE id=?', [id]);
        return course;
    }
    async update(id, body, file, user) {
        const [[course]] = await this.db.query('SELECT * FROM courses WHERE id=?', [id]);
        if (!course)
            throw new common_1.NotFoundException('Not found');
        if (course.instructor_id !== user.id && user.role !== 'admin')
            throw new common_1.ForbiddenException();
        const thumbnail = file ? `/uploads/thumbnails/${file.filename}` : course.thumbnail;
        const { title, description, price, level, language, categoryId, passing_score } = body;
        await this.db.query('UPDATE courses SET title=?,description=?,price=?,level=?,language=?,thumbnail=?,category_id=?,passing_score=?,updated_at=NOW() WHERE id=?', [title || course.title, description || course.description, price ?? course.price, level || course.level,
            language || course.language, thumbnail, categoryId || course.category_id, passing_score || course.passing_score, id]);
        const [[updated]] = await this.db.query('SELECT * FROM courses WHERE id=?', [id]);
        return updated;
    }
    async togglePublish(id, user) {
        const [[course]] = await this.db.query('SELECT * FROM courses WHERE id=?', [id]);
        if (!course)
            throw new common_1.NotFoundException('Not found');
        if (course.instructor_id !== user.id && user.role !== 'admin')
            throw new common_1.ForbiddenException();
        await this.db.query('UPDATE courses SET is_published=NOT is_published WHERE id=?', [id]);
        const [[updated]] = await this.db.query('SELECT * FROM courses WHERE id=?', [id]);
        return updated;
    }
    async remove(id, user) {
        const [[course]] = await this.db.query('SELECT * FROM courses WHERE id=?', [id]);
        if (!course)
            throw new common_1.NotFoundException('Not found');
        if (course.instructor_id !== user.id && user.role !== 'admin')
            throw new common_1.ForbiddenException();
        await this.db.query('DELETE FROM courses WHERE id=?', [id]);
        return { message: 'Deleted' };
    }
};
exports.CoursesService = CoursesService;
exports.CoursesService = CoursesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.DB_POOL)),
    __metadata("design:paramtypes", [Object])
], CoursesService);
//# sourceMappingURL=courses.service.js.map