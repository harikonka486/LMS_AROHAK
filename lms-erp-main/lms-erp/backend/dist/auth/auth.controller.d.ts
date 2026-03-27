import { AuthService } from './auth.service';
export declare class AuthController {
    private auth;
    constructor(auth: AuthService);
    register(body: any): Promise<{
        token: string;
        user: any;
    }>;
    login(body: any): Promise<{
        token: string;
        user: any;
    }>;
    verifyEmail(token: string): Promise<{
        message: string;
    }>;
    forgotPassword(body: {
        email: string;
    }): Promise<{
        message: string;
    }>;
    resetPassword(body: {
        token: string;
        password: string;
    }): Promise<{
        message: string;
    }>;
}
