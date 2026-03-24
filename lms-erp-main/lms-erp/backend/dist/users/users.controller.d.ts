import { UsersService } from './users.service';
export declare class UsersController {
    private users;
    constructor(users: UsersService);
    findAll(): Promise<any>;
    stats(): Promise<{
        totalCourses: any;
        totalEnrollments: any;
        completedEnrollments: any;
        totalCertificates: any;
        totalUsers: any;
    }>;
    changeRole(id: string, role: string): Promise<{
        success: boolean;
    }>;
    progress(id: string): Promise<any>;
    delete(id: string, req: any): Promise<{
        success: boolean;
    }>;
}
