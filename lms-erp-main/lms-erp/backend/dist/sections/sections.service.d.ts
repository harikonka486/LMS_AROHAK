import type { Pool } from 'mysql2/promise';
export declare class SectionsService {
    private db;
    constructor(db: Pool);
    create(courseId: string, title: string): Promise<any>;
    update(id: string, title: string): Promise<any>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
