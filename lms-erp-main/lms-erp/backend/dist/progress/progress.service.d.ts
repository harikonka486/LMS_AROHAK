import type { Pool } from 'mysql2/promise';
export declare class ProgressService {
    private db;
    constructor(db: Pool);
    syncEnrollmentStatus(enrollmentId: string, userId: string, courseId: string): Promise<{
        totalLessons: any;
        doneLessons: any;
        totalQuizzes: any;
        passedQuizzes: any;
    }>;
    completeLesson(lessonId: string, userId: string): Promise<{
        completed: boolean;
        totalLessons: any;
        completedLessons: any;
    }>;
    getCourseProgress(courseId: string, userId: string): Promise<{
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
