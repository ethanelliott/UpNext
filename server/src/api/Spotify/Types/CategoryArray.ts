import PagingObject from "./PagingObject";
import CategoryObject from "./CategoryObject";

export default class CategoryArray {
    public categories: PagingObject<CategoryObject>;

    public constructor() {
    }
}
