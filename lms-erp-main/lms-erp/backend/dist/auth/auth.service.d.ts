import { JwtService } from '@nestjs/jwt';
import type { Pool } from 'mysql2/promise';
import { MailService } from '../mail/mail.service';
export declare class AuthService {
    private db;
    private jwt;
    private mail;
    constructor(db: Pool, jwt: JwtService, mail: MailService);
    private sign;
    private isAllowedEmail;
    register(body: any): Promise<{
        token: string;
        user: any;
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
