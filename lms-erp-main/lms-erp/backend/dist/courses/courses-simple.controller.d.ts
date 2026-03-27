import { CoursesSimpleService } from './courses-simple.service';
export declare class CoursesSimpleController {
    private courses;
    constructor(courses: CoursesSimpleService);
    findOne(id: string): Promise<any>;
    create(body: any, file: any, req: any): Promise<any>;
}
