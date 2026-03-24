import { ProgressService } from './progress.service';
export declare class ProgressController {
    private progress;
    constructor(progress: ProgressService);
    complete(lessonId: string, req: any): Promise<{
        completed: boolean;
        totalLessons: any;
        completedLessons: any;
    }>;
    getCourse(courseId: string, req: any): Promise<{
        enrolled: boolean;
        progress?: undefined;
        completedLessons?: undefined;
        totalLessons?: undefined;
        percentage?: undefined;
        completedAt?: undefined;
        status?: undefined;
    } | {
        enrolled: boolean;
        progress: any;
        completedLessons: any;
        totalLessons: number;
        percentage: number;
        completedAt: any;
        status: any;
    }>;
}
