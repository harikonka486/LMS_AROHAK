import type { Pool } from 'mysql2/promise';
export declare class UsersService {
    private db;
    constructor(db: Pool);
    findAll(): Promise<any>;
    getStats(): Promise<{
        totalCourses: any;
        totalEnrollments: any;
        completedEnrollments: any;
        totalCertificates: any;
        totalUsers: any;
    }>;
    changeRole(id: string, role: string): Promise<{
        success: boolean;
    }>;
    getUserProgress(id: string): Promise<any>;
    deleteUser(id: string, currentUserId: string): Promise<{
        success: boolean;
    }>;
}
