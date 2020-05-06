import { Service } from "typedi";
import { DatabaseService } from "./DatabaseService";
import QueryFactory from "../../Factory/QueryFactory";
import { AdminUserDb } from "../../Types/DatabaseMaps/AdminUserDb";

@Service()
export class AdminUserDatabaseService {

    private readonly tableName: string = 'adminUsers';

    constructor(
        private databaseService: DatabaseService
    ) {
        try {
            this.databaseService.db.prepare(`SELECT * FROM ${this.tableName}`).get();
        } catch (e) {
            this.buildTable();
        }
    }

    public insertNewUser(username: AdminUserDb): void {
        this.databaseService.insert({
            into: this.tableName,
            insert: username
        });
    }

    public getUserCount(): number {
        return this.databaseService.queryAll<AdminUserDb>({
            from: this.tableName,
            select: ['*'],
        }).length;
    }

    public getUserByUsername(username: string): AdminUserDb {
        return this.databaseService.queryOne<AdminUserDb>({
            from: this.tableName,
            select: ['*'],
            where: [
                {key: 'username', operator: '=', value: username}
            ]
        });
    }

    private buildTable() {
        this.databaseService.db.prepare(QueryFactory.buildCreateFrom({
            name: this.tableName,
            columns: [
                {name: 'id', type: 'TEXT', unique: true, notNull: true, primaryKey: true},
                {name: 'username', type: 'TEXT', unique: true, notNull: true},
                {name: 'password', type: 'TEXT', unique: false, notNull: true},
            ]
        })).run();
    }
}