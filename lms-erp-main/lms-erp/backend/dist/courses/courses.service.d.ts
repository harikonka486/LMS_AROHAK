import type { Pool } from 'mysql2/promise';
export declare class CoursesService {
    private db;
    constructor(db: Pool);
    findAll(query: any): Promise<{
        courses: any;
        total: any;
        pages: number;
        page: number;
    }>;
    findMy(userId: string): Promise<any>;
    findOne(id: string): Promise<any>;
    create(body: any, file: any, userId: string): Promise<any>;
    update(id: string, body: any, file: any, user: any): Promise<any>;
    togglePublish(id: string, user: any): Promise<any>;
    remove(id: string, user: any): Promise<{
        message: string;
    }>;
}
