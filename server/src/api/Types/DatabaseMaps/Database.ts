export class Select {
    select: string[];
    from: string;
    where?: Where[];
}

export class Insert {
    into: string;
    insert: {};
}

export class Update {
    update: string;
    set: {};
    where?: Where[];
}

export class Delete {
    from: string;
    where?: Where[];
}

export class Where {
    key: string;
    operator: '<' | '>' | '=';
    value: any;
}

export class Create {
    name: string;
    columns: Column[];
}

export class Column {
    name: string;
    type: 'TEXT' | 'INTEGER' | 'BLOB' | 'REAL' | 'NUMERIC' | 'BIGINT';
    notNull?: boolean = false;
    primaryKey?: boolean = false;
    autoIncrement?: boolean = false;
    unique?: boolean = false;
    defaultValue?: any;
    foreignKey?: ForeignKey;
}

export class ForeignKey {
    table: string;
    name: string;
}