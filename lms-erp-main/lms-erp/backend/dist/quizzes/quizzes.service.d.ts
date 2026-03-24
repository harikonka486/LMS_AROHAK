import type { Pool } from 'mysql2/promise';
import { ProgressService } from '../progress/progress.service';
export declare class QuizzesService {
    private db;
    private progress;
    constructor(db: Pool, progress: ProgressService);
    findByCourse(courseId: string): Promise<any>;
    findOne(id: string, userRole: string): Promise<any>;
    create(courseId: string, body: any): Promise<any>;
    submit(quizId: string, answers: number[], userId: string): Promise<{
        score: number;
        passed: boolean;
        correct: number;
        total: any;
        results: any;
        passingScore: any;
    }>;
}
