import CursorObject from "./CursorObject";

export default class CursorPagingObject {
    public href: string;
    public items: Array<Object>;
    public limit: number;
    public next: string;
    public cursors: CursorObject;
    public total: number;

    public constructor() {
        if (this.href === undefined) this.href = null;
        if (this.items === undefined) this.items = null;
        if (this.limit === undefined) this.limit = 0;
        if (this.next === undefined) this.next = null;
        if (this.cursors === undefined) this.cursors = null;
        if (this.total === undefined) this.total = 0;
    }
}
