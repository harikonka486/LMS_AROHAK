import { SectionsService } from './sections.service';
export declare class SectionsController {
    private sections;
    constructor(sections: SectionsService);
    create(courseId: string, title: string): Promise<any>;
    update(id: string, title: string): Promise<any>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
