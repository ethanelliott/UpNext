import { Service } from "typedi";
import Database, { Statement } from 'better-sqlite3';
import { Delete, Insert, Select, Update } from "../../Types/DatabaseMaps/Database";
import QueryFactory from "../../Factory/QueryFactory";
import { log } from "../../../util/Log";


@Service()
export class DatabaseService {
    public db: any;

    constructor() {
        this.db = new Database('./store.db', {verbose: log.db});
    }

    public queryOne<T>(params: Select): T {
        return params.where
            ? this.query(params).get(params.where.map(e => e.value))
            : this.query(params).get();
    }

    public queryAll<T>(params: Select): Array<T> {
        return params.where
            ? this.query(params).all(params.where.map(e => e.value))
            : this.query(params).all();
    }

    public insert(params: Insert) {
        this.db.prepare(QueryFactory.buildInsertFrom(params)).run(Object.values(params.insert) as any);
    }

    public update(params: Update) {
        this.db.prepare(QueryFactory.buildUpdateFrom(params)).run([...Object.values(params.set), ...params.where.map(e => e.value)] as any);
    }

    public delete(params: Delete) {
        this.db.prepare(QueryFactory.buildDeleteFrom(params)).run(params.where.map(e => e.value) as any);
    }

    private query(params: Select): Statement {
        return this.db.prepare(QueryFactory.buildQueryFrom(params));
    }
}