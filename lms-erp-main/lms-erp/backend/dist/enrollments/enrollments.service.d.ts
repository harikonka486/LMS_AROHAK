import type { Pool } from 'mysql2/promise';
export declare class EnrollmentsService {
    private db;
    constructor(db: Pool);
    enroll(userId: string, courseId: string): Promise<any>;
    findMy(userId: string): Promise<any>;
    unenroll(enrollmentId: string): Promise<{
        message: string;
    }>;
    check(userId: string, courseId: string): Promise<{
        enrolled: boolean;
        enrollment: any;
    }>;
}
