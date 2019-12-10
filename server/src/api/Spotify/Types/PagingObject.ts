export default class PagingObject {
    public items: Array<Object>;
    public href: string;
    public limit: number;
    public next: string;
    public offset: number;
    public previous: string;
    public total: number;

    public constructor() {
    }
}
