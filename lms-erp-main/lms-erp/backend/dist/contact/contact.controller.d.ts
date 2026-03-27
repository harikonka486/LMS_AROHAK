import { MailService } from '../mail/mail.service';
export declare class ContactController {
    private mail;
    constructor(mail: MailService);
    contact(body: {
        name: string;
        email: string;
        phone?: string;
        message: string;
    }): Promise<{
        error: string;
        message?: undefined;
    } | {
        message: string;
        error?: undefined;
    }>;
}
