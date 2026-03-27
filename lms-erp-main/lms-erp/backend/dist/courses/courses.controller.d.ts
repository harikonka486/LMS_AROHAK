import { CoursesService } from './courses.service';
export declare class CoursesController {
    private courses;
    constructor(courses: CoursesService);
    findAll(query: any): Promise<{
        courses: any;
        total: any;
        pages: number;
        page: number;
    }>;
    findMy(req: any): Promise<any>;
    findOne(id: string): Promise<any>;
    create(body: any, file: any, req: any): Promise<any>;
    update(id: string, body: any, file: any, req: any): Promise<any>;
    togglePublish(id: string, req: any): Promise<any>;
    remove(id: string, req: any): Promise<{
        message: string;
    }>;
}
