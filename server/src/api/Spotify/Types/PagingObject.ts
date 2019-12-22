export default class PagingObject<T> {
    public items: Array<T>;
    public href: string;
    public limit: number;
    public next: string;
    public offset: number;
    public previous: string;
    public total: number;

    public constructor() {
    }
}
