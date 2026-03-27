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
exports.DocumentsService = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
const database_module_1 = require("../database/database.module");
let DocumentsService = class DocumentsService {
    db;
    constructor(db) {
        this.db = db;
    }
    async upload(courseId, body, file, user) {
        const [[course]] = (await this.db.query('SELECT * FROM courses WHERE id=?', [courseId]));
        if (!course)
            throw new common_1.NotFoundException('Course not found');
        if (course.instructor_id !== user.id && user.role !== 'admin')
            throw new common_1.ForbiddenException('Not authorized to upload to this course');
        const { title } = body;
        const file_url = file ? `/uploads/documents/${file.filename}` : null;
        const file_type = file ? file.mimetype : null;
        const file_size = file ? file.size : null;
        const id = (0, uuid_1.v4)();
        const [[{ max_order }]] = (await this.db.query('SELECT COALESCE(MAX(order_num), 0) as max_order FROM course_documents WHERE course_id=?', [courseId]));
        await this.db.query('INSERT INTO course_documents (id, course_id, title, file_url, file_type, file_size, order_num) VALUES (?, ?, ?, ?, ?, ?, ?)', [
            id,
            courseId,
            title || file?.originalname || 'Document',
            file_url,
            file_type,
            file_size,
            max_order + 1,
        ]);
        const [[document]] = (await this.db.query('SELECT * FROM course_documents WHERE id=?', [id]));
        return document;
    }
    async findByCourse(courseId) {
        const [documents] = (await this.db.query('SELECT * FROM course_documents WHERE course_id=? ORDER BY order_num', [courseId]));
        return documents;
    }
    async delete(id, user) {
        const [[document]] = (await this.db.query('SELECT d.*, c.instructor_id FROM course_documents d JOIN courses c ON d.course_id = c.id WHERE d.id=?', [id]));
        if (!document)
            throw new common_1.NotFoundException('Document not found');
        if (document.instructor_id !== user.id && user.role !== 'admin')
            throw new common_1.ForbiddenException('Not authorized to delete this document');
        await this.db.query('DELETE FROM course_documents WHERE id=?', [id]);
        return { message: 'Document deleted successfully' };
    }
};
exports.DocumentsService = DocumentsService;
exports.DocumentsService = DocumentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.DB_POOL)),
    __metadata("design:paramtypes", [Object])
], DocumentsService);
//# sourceMappingURL=documents.service.js.map