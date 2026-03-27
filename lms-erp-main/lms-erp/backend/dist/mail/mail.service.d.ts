import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class MailService implements OnModuleInit {
    private config;
    private readonly logger;
    private transporter;
    constructor(config: ConfigService);
    onModuleInit(): Promise<void>;
    sendContact(name: string, email: string, phone: string, message: string): Promise<void>;
    sendWelcome(to: string, name: string, verifyToken?: string): Promise<void>;
    sendCertificate(to: string, name: string, courseName: string, certNumber: string, verifyUrl: string, employeeId?: string, department?: string, instructorName?: string, issuedAt?: Date, score?: number): Promise<void>;
    sendPasswordReset(to: string, name: string, resetToken: string): Promise<void>;
}
