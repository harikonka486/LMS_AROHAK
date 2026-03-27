import type { Pool } from 'mysql2/promise';
export declare class CoursesSimpleService {
    private db;
    constructor(db: Pool);
    create(body: any, file: any, userId: string): Promise<any>;
    findOne(id: string): Promise<any>;
}
