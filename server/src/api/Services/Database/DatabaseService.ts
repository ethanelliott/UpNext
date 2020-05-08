import { Service } from "typedi";
import { Pool, QueryResult } from 'pg';
import { env } from "../../../env";
import { Create, Delete, Insert, Select, Update } from "../../Types/DatabaseMaps/Database";
import QueryFactory from "../../Factory/QueryFactory";
import { log } from "../../../util/Log";


@Service()
export class DatabaseService {
    private pgPool: Pool;
    private tables: Array<string>;

    constructor() {
        // create connection pool
        this.pgPool = new Pool({
            connectionString: `${env.app.database.url}`,
            ssl: {rejectUnauthorized: false}
        });
        this.tables = [];
    }

    public async connect() {
        const queryString = `SELECT * FROM pg_catalog.pg_tables WHERE schemaname != 'pg_catalog' AND schemaname != 'information_schema'`;
        const tableTest = await this._query(queryString);
        this.tables = tableTest.rows.map(e => e.tablename);
    }

    public getTables(): Array<string> {
        return this.tables;
    }

    public async queryOne<T>(params: Select): Promise<T> {
        const res = await this.query<T>(params);
        return res.length > 0 ? res[0] : null;
    }

    public async queryAll<T>(params: Select): Promise<Array<T>> {
        return await this.query<T>(params);
    }

    public async insert(params: Insert): Promise<void> {
        await this._query(QueryFactory.buildInsertFrom(params), Object.values(params.insert));
    }

    public async update(params: Update): Promise<void> {
        await this._query(QueryFactory.buildUpdateFrom(params), [...Object.values(params.set), ...params.where.map(e => e.value)]);
    }

    public async delete(params: Delete): Promise<void> {
        await this._query(QueryFactory.buildDeleteFrom(params), params.where.map(e => e.value));
    }

    public tableExists(tableName: string): boolean {
        return this.getTables().includes(tableName);
    }

    public async createTable(params: Create): Promise<void> {
        // make sure that the table doesn't exist
        if (!this.tableExists(params.name)) {
            await this._query(QueryFactory.buildCreateFrom(params));
            this.tables.push(params.name);
        }
    }

    private async _query(queryString: string, values: Array<any> = []): Promise<QueryResult> {
        log.db(queryString);
        try {
            return await this.pgPool.query(queryString, values);
        } catch (e) {
            log.error(`Database Error: ${e}`);
        }
        return null;
    }

    private async query<T>(params: Select): Promise<Array<T>> {
        const res = await this._query(
            QueryFactory.buildQueryFrom(params),
            params.where ? params.where.map(e => e.value) : []
        );
        return res.rows;
    }
}