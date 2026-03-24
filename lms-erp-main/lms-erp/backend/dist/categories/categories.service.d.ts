import type { Pool } from 'mysql2/promise';
export declare class CategoriesService {
    private db;
    constructor(db: Pool);
    findAll(): Promise<any>;
}
