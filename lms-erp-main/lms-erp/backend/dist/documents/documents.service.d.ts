import type { Pool } from 'mysql2/promise';
export declare class DocumentsService {
    private db;
    constructor(db: Pool);
    upload(courseId: string, body: any, file: any, user: any): Promise<any>;
    findByCourse(courseId: string): Promise<any>;
    delete(id: string, user: any): Promise<{
        message: string;
    }>;
}
