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
exports.CertificatesService = void 0;
const common_1 = require("@nestjs/common");
const database_module_1 = require("../database/database.module");
let CertificatesService = class CertificatesService {
    db;
    constructor(db) {
        this.db = db;
    }
    async findMy(userId) {
        const [rows] = await this.db.query(`
      SELECT cert.*, c.title AS course_title, c.thumbnail,
             u.name AS user_name, u.employee_id, u.department, inst.name AS instructor_name
      FROM certificates cert JOIN courses c ON c.id=cert.course_id
      JOIN users u ON u.id=cert.user_id JOIN users inst ON inst.id=c.instructor_id
      WHERE cert.user_id=? ORDER BY cert.issued_at DESC
    `, [userId]);
        return rows;
    }
    async verify(number) {
        const [[cert]] = await this.db.query(`
      SELECT cert.*, c.title AS course_title, u.name AS user_name, u.employee_id
      FROM certificates cert JOIN courses c ON c.id=cert.course_id JOIN users u ON u.id=cert.user_id
      WHERE cert.certificate_number=?
    `, [number]);
        return { valid: !!cert, certificate: cert || null };
    }
    async findOne(id) {
        const [[cert]] = await this.db.query(`
      SELECT cert.*, c.title AS course_title, c.description AS course_description,
             u.name AS user_name, u.employee_id, u.department, inst.name AS instructor_name
      FROM certificates cert JOIN courses c ON c.id=cert.course_id
      JOIN users u ON u.id=cert.user_id JOIN users inst ON inst.id=c.instructor_id
      WHERE cert.id=?
    `, [id]);
        if (!cert)
            throw new common_1.NotFoundException('Not found');
        return cert;
    }
};
exports.CertificatesService = CertificatesService;
exports.CertificatesService = CertificatesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.DB_POOL)),
    __metadata("design:paramtypes", [Object])
], CertificatesService);
//# sourceMappingURL=certificates.service.js.map