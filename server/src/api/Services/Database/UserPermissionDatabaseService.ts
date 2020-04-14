import { Service } from "typedi";
import { DatabaseService } from "./DatabaseService";
import QueryFactory from "../../Factory/QueryFactory";

@Service()
export class UserPermissionDatabaseService {

    private readonly tableName: string = 'userPermissions';

    constructor(
        private databaseService: DatabaseService
    ) {
        try {
            this.databaseService.db.prepare(`SELECT * FROM ${this.tableName}`).get();
        } catch (e) {
            this.buildTable();
            this.insetDefaultValues();
        }
    }

    private buildTable() {
        this.databaseService.db.prepare(QueryFactory.buildCreateFrom({
            name: this.tableName,
            columns: [
                {name: 'id', type: 'INTEGER', unique: true, notNull: true, primaryKey: true},
                {name: 'name', type: 'TEXT', notNull: true}
            ]
        })).run();
    }

    private insetDefaultValues() {
        this.databaseService.insert({
            into: this.tableName,
            insert: {
                id: 0,
                name: 'default'
            }
        });
        this.databaseService.insert({
            into: this.tableName,
            insert: {
                id: 1,
                name: 'admin'
            }
        });
    }
}