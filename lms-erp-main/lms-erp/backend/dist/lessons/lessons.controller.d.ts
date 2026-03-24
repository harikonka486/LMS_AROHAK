import { LessonsService } from './lessons.service';
export declare class LessonsController {
    private lessons;
    constructor(lessons: LessonsService);
    findOne(id: string): Promise<any>;
    create(sectionId: string, body: any, file: any): Promise<any>;
    update(id: string, body: any, file: any): Promise<any>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
