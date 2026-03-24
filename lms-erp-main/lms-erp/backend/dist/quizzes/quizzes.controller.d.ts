import { QuizzesService } from './quizzes.service';
export declare class QuizzesController {
    private quizzes;
    constructor(quizzes: QuizzesService);
    findByCourse(courseId: string): Promise<any>;
    findOne(id: string, req: any): Promise<any>;
    create(courseId: string, body: any): Promise<any>;
    submit(id: string, answers: number[], req: any): Promise<{
        score: number;
        passed: boolean;
        correct: number;
        total: any;
        results: any;
        passingScore: any;
    }>;
}
