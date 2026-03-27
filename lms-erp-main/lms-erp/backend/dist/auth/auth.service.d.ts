import { JwtService } from '@nestjs/jwt';
import type { Pool } from 'mysql2/promise';
import { MailService } from '../mail/mail.service';
export declare class AuthService {
    private db;
    private jwt;
    private mail;
    constructor(db: Pool, jwt: JwtService, mail: MailService);
    private sign;
    register(body: any): Promise<{
        token: string;
        user: any;
    }>;
    verifyEmail(token: string): Promise<{
        message: string;
    }>;
    login(body: any): Promise<{
        token: string;
        user: any;
    }>;
    forgotPassword(email: string): Promise<{
        message: string;
    }>;
    resetPassword(token: string, newPassword: string): Promise<{
        message: string;
    }>;
}
