import type { Pool } from 'mysql2/promise';
export declare class CertificatesService {
    private db;
    constructor(db: Pool);
    findAll(): Promise<any>;
    findMy(userId: string): Promise<any>;
    verify(number: string): Promise<{
        valid: boolean;
        certificate: any;
    }>;
    findOne(id: string): Promise<any>;
    delete(id: string): Promise<{
        message: string;
    }>;
}
