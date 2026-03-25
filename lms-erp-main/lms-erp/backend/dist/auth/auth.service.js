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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcryptjs"));
const uuid_1 = require("uuid");
const database_module_1 = require("../database/database.module");
const mail_service_1 = require("../mail/mail.service");
let AuthService = class AuthService {
    db;
    jwt;
    mail;
    constructor(db, jwt, mail) {
        this.db = db;
        this.jwt = jwt;
        this.mail = mail;
    }
    sign(id) {
        return this.jwt.sign({ id });
    }
    isAllowedEmail(email) {
        return !!email;
    }
    async register(body) {
        const { name, email, password, role, department, employee_id } = body;
        if (!this.isAllowedEmail(email))
            throw new common_1.BadRequestException('Only @arohak.com or @cognivance.com email addresses are allowed');
        const [exists] = await this.db.query('SELECT id FROM users WHERE email=?', [email]);
        if (exists.length)
            throw new common_1.BadRequestException('Email already in use');
        const hashed = await bcrypt.hash(password, 10);
        const id = (0, uuid_1.v4)();
        const userRole = role === 'admin' ? 'admin' : 'employee';
        await this.db.query('INSERT INTO users (id,name,email,password,role,department,employee_id) VALUES (?,?,?,?,?,?,?)', [id, name, email, hashed, userRole, department || null, employee_id || null]);
        const [[user]] = await this.db.query('SELECT id,name,email,role,avatar,department,employee_id,created_at FROM users WHERE id=?', [id]);
        this.mail.sendWelcome(email, name);
        return { token: this.sign(id), user };
    }
    async login(body) {
        const { email, password } = body;
        if (!this.isAllowedEmail(email))
            throw new common_1.BadRequestException('Only @arohak.com or @cognivance.com email addresses are allowed');
        const [[user]] = await this.db.query('SELECT * FROM users WHERE email=?', [email]);
        if (!user || !(await bcrypt.compare(password, user.password)))
            throw new common_1.UnauthorizedException('Invalid credentials');
        const { password: _, ...userData } = user;
        return { token: this.sign(user.id), user: userData };
    }
    async forgotPassword(email) {
        const [[user]] = await this.db.query('SELECT id, name FROM users WHERE email=?', [email]);
        if (!user)
            return { message: 'If that email exists, a reset link has been sent.' };
        await this.db.query('UPDATE password_reset_tokens SET used=1 WHERE user_id=?', [user.id]);
        const token = (0, uuid_1.v4)();
        await this.db.query('INSERT INTO password_reset_tokens (id, user_id, token, expires_at) VALUES (?,?,?, DATE_ADD(NOW(), INTERVAL 1 HOUR))', [(0, uuid_1.v4)(), user.id, token]);
        this.mail.sendPasswordReset(email, user.name, token);
        return { message: 'If that email exists, a reset link has been sent.' };
    }
    async resetPassword(token, newPassword) {
        const [[record]] = await this.db.query('SELECT * FROM password_reset_tokens WHERE token=? AND used=0 AND expires_at > NOW()', [token]);
        if (!record) {
            console.log(`[ResetPassword] Token lookup failed for token: ${token}`);
            throw new common_1.BadRequestException('Invalid or expired reset token');
        }
        const hashed = await bcrypt.hash(newPassword, 10);
        await this.db.query('UPDATE users SET password=? WHERE id=?', [hashed, record.user_id]);
        await this.db.query('UPDATE password_reset_tokens SET used=1 WHERE id=?', [record.id]);
        return { message: 'Password reset successfully. You can now log in.' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.DB_POOL)),
    __metadata("design:paramtypes", [Object, jwt_1.JwtService,
        mail_service_1.MailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map