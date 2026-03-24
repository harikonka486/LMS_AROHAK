"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcryptjs"));
const uuid_1 = require("uuid");
const sync_1 = require("csv-parse/sync");
const database_module_1 = require("../database/database.module");
let UsersService = class UsersService {
    db;
    constructor(db) {
        this.db = db;
    }
    async findAll() {
        const [rows] = await this.db.query('SELECT id,name,email,role,employee_id,department,created_at FROM users ORDER BY created_at DESC');
        return rows;
    }
    async getStats() {
        const [[{ totalCourses }]] = await this.db.query('SELECT COUNT(*) AS totalCourses FROM courses');
        const [[{ totalEnrollments }]] = await this.db.query('SELECT COUNT(*) AS totalEnrollments FROM enrollments');
        const [[{ completedEnrollments }]] = await this.db.query("SELECT COUNT(*) AS completedEnrollments FROM enrollments WHERE status='completed'");
        const [[{ totalCertificates }]] = await this.db.query('SELECT COUNT(*) AS totalCertificates FROM certificates');
        const [[{ totalUsers }]] = await this.db.query('SELECT COUNT(*) AS totalUsers FROM users');
        return { totalCourses, totalEnrollments, completedEnrollments, totalCertificates, totalUsers };
    }
    async importCsv(buffer) {
        const records = (0, sync_1.parse)(buffer.toString('utf-8'), { columns: true, skip_empty_lines: true, trim: true });
        const hashed = await bcrypt.hash('Welcome@123', 10);
        let created = 0, skipped = 0;
        const errors = [];
        for (const row of records) {
            const name = row.name || row.Name;
            const email = (row.email || row.Email || '').toLowerCase().trim();
            const employee_id = row.employee_id || row['Employee ID'] || '';
            const department = row.department || row.Department || '';
            const role = (row.role || 'employee').toLowerCase().trim();
            const validRole = ['employee', 'admin'].includes(role) ? role : 'employee';
            if (!name || !email) {
                skipped++;
                errors.push('Row skipped — missing name or email');
                continue;
            }
            try {
                const [existing] = await this.db.query('SELECT id FROM users WHERE email=?', [email]);
                if (existing.length) {
                    skipped++;
                    errors.push(`${email} — already exists`);
                    continue;
                }
                await this.db.query('INSERT INTO users (id,name,email,password,role,employee_id,department) VALUES (?,?,?,?,?,?,?)', [(0, uuid_1.v4)(), name, email, hashed, validRole, employee_id, department]);
                created++;
            }
            catch (e) {
                skipped++;
                errors.push(`${email} — ${e.message}`);
            }
        }
        return { created, skipped, total: records.length, errors };
    }
    async changeRole(id, role) {
        if (!['employee', 'admin'].includes(role))
            throw new common_1.BadRequestException('Invalid role');
        await this.db.query('UPDATE users SET role=? WHERE id=?', [role, id]);
        return { success: true };
    }
    async getUserProgress(id) {
        const [rows] = await this.db.query(`
      SELECT e.id AS enrollment_id, e.status, e.enrolled_at, e.completed_at,
             c.id AS course_id, c.title AS course_title, c.level,
             (SELECT COUNT(*) FROM lessons l JOIN sections s ON s.id=l.section_id WHERE s.course_id=c.id) AS total_lessons,
             (SELECT COUNT(*) FROM lesson_progress lp WHERE lp.enrollment_id=e.id AND lp.completed=1) AS completed_lessons,
             (SELECT COUNT(*) FROM quizzes WHERE course_id=c.id) AS total_quizzes,
             (SELECT COUNT(DISTINCT qa.quiz_id) FROM quiz_attempts qa JOIN quizzes q ON q.id=qa.quiz_id
              WHERE qa.user_id=e.user_id AND q.course_id=c.id AND qa.passed=1) AS passed_quizzes,
             (SELECT certificate_number FROM certificates WHERE user_id=e.user_id AND course_id=c.id LIMIT 1) AS certificate_number
      FROM enrollments e JOIN courses c ON c.id=e.course_id
      WHERE e.user_id=? ORDER BY e.enrolled_at DESC
    `, [id]);
        return rows;
    }
    async deleteUser(id, currentUserId) {
        if (id === currentUserId)
            throw new common_1.BadRequestException('Cannot delete yourself');
        await this.db.query('DELETE FROM users WHERE id=?', [id]);
        return { success: true };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.DB_POOL)),
    __metadata("design:paramtypes", [Object])
], UsersService);
//# sourceMappingURL=users.service.js.map