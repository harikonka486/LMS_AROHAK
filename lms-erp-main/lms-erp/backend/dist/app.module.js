"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const database_module_1 = require("./database/database.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const courses_module_1 = require("./courses/courses.module");
const categories_module_1 = require("./categories/categories.module");
const sections_module_1 = require("./sections/sections.module");
const lessons_module_1 = require("./lessons/lessons.module");
const enrollments_module_1 = require("./enrollments/enrollments.module");
const progress_module_1 = require("./progress/progress.module");
const quizzes_module_1 = require("./quizzes/quizzes.module");
const certificates_module_1 = require("./certificates/certificates.module");
const health_module_1 = require("./health/health.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            database_module_1.DatabaseModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            courses_module_1.CoursesModule,
            categories_module_1.CategoriesModule,
            sections_module_1.SectionsModule,
            lessons_module_1.LessonsModule,
            enrollments_module_1.EnrollmentsModule,
            progress_module_1.ProgressModule,
            quizzes_module_1.QuizzesModule,
            certificates_module_1.CertificatesModule,
            health_module_1.HealthModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map