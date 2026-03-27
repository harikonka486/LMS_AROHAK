import { CertificatesService } from './certificates.service';
export declare class CertificatesController {
    private certs;
    constructor(certs: CertificatesService);
    findAll(): Promise<any>;
    findMy(req: any): Promise<any>;
    verify(number: string): Promise<{
        valid: boolean;
        certificate: any;
    }>;
    findOne(id: string): Promise<any>;
    delete(id: string): Promise<{
        message: string;
    }>;
}
