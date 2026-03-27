import { DocumentsService } from './documents.service';
export declare class DocumentsController {
    private documents;
    constructor(documents: DocumentsService);
    uploadDocument(courseId: string, body: any, file: any, req: any): Promise<any>;
    findCourseDocuments(courseId: string): Promise<any>;
    deleteDocument(id: string, req: any): Promise<{
        message: string;
    }>;
}
