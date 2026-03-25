import { EnrollmentsService } from './enrollments.service';
export declare class EnrollmentsController {
    private enrollments;
    constructor(enrollments: EnrollmentsService);
    enroll(req: any, courseId: string): Promise<any>;
    findMy(req: any): Promise<any>;
    check(req: any, courseId: string): Promise<{
        enrolled: boolean;
        enrollment: any;
    }>;
    unenroll(id: string): Promise<{
        message: string;
    }>;
}
