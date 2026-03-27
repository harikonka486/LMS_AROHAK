import type { Pool } from 'mysql2/promise';
export declare class LessonsService {
    private db;
    constructor(db: Pool);
    findOne(id: string): Promise<any>;
    create(sectionId: string, body: any, file: any): Promise<any>;
    update(id: string, body: any, file: any): Promise<any>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
