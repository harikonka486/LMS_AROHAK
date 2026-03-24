import { CategoriesService } from './categories.service';
export declare class CategoriesController {
    private categories;
    constructor(categories: CategoriesService);
    findAll(): Promise<any>;
}
