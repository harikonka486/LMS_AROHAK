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
exports.SectionsService = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
const database_module_1 = require("../database/database.module");
let SectionsService = class SectionsService {
    db;
    constructor(db) {
        this.db = db;
    }
    async create(courseId, title) {
        const [[{ count }]] = (await this.db.query('SELECT COUNT(*) AS count FROM sections WHERE course_id=?', [courseId]));
        const id = (0, uuid_1.v4)();
        await this.db.query('INSERT INTO sections (id,title,order_num,course_id) VALUES (?,?,?,?)', [id, title, Number(count) + 1, courseId]);
        const [[s]] = (await this.db.query('SELECT * FROM sections WHERE id=?', [
            id,
        ]));
        return s;
    }
    async update(id, title) {
        await this.db.query('UPDATE sections SET title=? WHERE id=?', [title, id]);
        const [[s]] = (await this.db.query('SELECT * FROM sections WHERE id=?', [
            id,
        ]));
        return s;
    }
    async remove(id) {
        await this.db.query('DELETE FROM sections WHERE id=?', [id]);
        return { message: 'Deleted' };
    }
};
exports.SectionsService = SectionsService;
exports.SectionsService = SectionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.DB_POOL)),
    __metadata("design:paramtypes", [Object])
], SectionsService);
//# sourceMappingURL=sections.service.js.map