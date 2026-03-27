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
exports.LessonsService = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
const database_module_1 = require("../database/database.module");
let LessonsService = class LessonsService {
    db;
    constructor(db) {
        this.db = db;
    }
    async findOne(id) {
        const [[lesson]] = (await this.db.query('SELECT * FROM lessons WHERE id=?', [id]));
        if (!lesson)
            throw new common_1.NotFoundException('Not found');
        return lesson;
    }
    async create(sectionId, body, file) {
        const [[{ count }]] = (await this.db.query('SELECT COUNT(*) AS count FROM lessons WHERE section_id=?', [sectionId]));
        const { title, description, video_url, sharepoint_video_url, google_drive_url, duration, is_free } = body;
        const video_file = file ? `/uploads/videos/${file.filename}` : null;
        const id = (0, uuid_1.v4)();
        await this.db.query('INSERT INTO lessons (id,title,description,video_url,sharepoint_video_url,google_drive_url,video_file,duration,is_free,order_num,section_id) VALUES (?,?,?,?,?,?,?,?,?,?,?)', [
            id,
            title,
            description || null,
            video_url || null,
            sharepoint_video_url || null,
            google_drive_url || null,
            video_file,
            duration || null,
            is_free ? 1 : 0,
            Number(count) + 1,
            sectionId,
        ]);
        const [[lesson]] = (await this.db.query('SELECT * FROM lessons WHERE id=?', [id]));
        return lesson;
    }
    async update(id, body, file) {
        const { title, description, video_url, sharepoint_video_url, google_drive_url, duration, is_free } = body;
        const video_file = file ? `/uploads/videos/${file.filename}` : undefined;
        const fields = [
            'title=?',
            'description=?',
            'video_url=?',
            'sharepoint_video_url=?',
            'google_drive_url=?',
            'duration=?',
            'is_free=?',
        ];
        const vals = [
            title,
            description,
            video_url,
            sharepoint_video_url,
            google_drive_url,
            duration,
            is_free ? 1 : 0,
        ];
        if (video_file) {
            fields.push('video_file=?');
            vals.push(video_file);
        }
        vals.push(id);
        await this.db.query(`UPDATE lessons SET ${fields.join(',')} WHERE id=?`, vals);
        const [[lesson]] = (await this.db.query('SELECT * FROM lessons WHERE id=?', [id]));
        return lesson;
    }
    async remove(id) {
        await this.db.query('DELETE FROM lessons WHERE id=?', [id]);
        return { message: 'Deleted' };
    }
};
exports.LessonsService = LessonsService;
exports.LessonsService = LessonsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.DB_POOL)),
    __metadata("design:paramtypes", [Object])
], LessonsService);
//# sourceMappingURL=lessons.service.js.map