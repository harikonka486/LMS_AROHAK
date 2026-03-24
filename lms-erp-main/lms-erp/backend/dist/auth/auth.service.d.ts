import { JwtService } from '@nestjs/jwt';
import type { Pool } from 'mysql2/promise';
export declare class AuthService {
    private db;
    private jwt;
    constructor(db: Pool, jwt: JwtService);
    private sign;
    register(body: any): Promise<{
        token: string;
        user: any;
    }>;
    login(body: any): Promise<{
        token: string;
        user: any;
    }>;
}
