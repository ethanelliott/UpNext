import { Service } from "typedi";
import { DatabaseService } from "./DatabaseService";
import QueryFactory from "../../Factory/QueryFactory";
import { UpdateDB } from "../../Types/DatabaseMaps/UpdateDB";

@Service()
export class AppUpdatesDatabaseService {

    private readonly tableName: string = 'updates';

    constructor(
        private databaseService: DatabaseService
    ) {
        try {
            this.databaseService.db.prepare(`SELECT * FROM ${this.tableName}`).get();
        } catch (e) {
            this.buildTable();
        }
    }

    public insertNewUpdate(update: UpdateDB): void {
        this.databaseService.insert({
            into: this.tableName,
            insert: update
        });
    }

    public getAllUpdates(): Array<UpdateDB> {
        return this.databaseService.queryAll<UpdateDB>({
            from: this.tableName,
            select: ['*']
        });
    }

    private buildTable() {
        this.databaseService.db.prepare(QueryFactory.buildCreateFrom({
            name: this.tableName,
            columns: [
                {name: 'id', type: 'TEXT', unique: true, notNull: true, primaryKey: true},
                {name: 'title', type: 'TEXT',},
                {name: 'date', type: 'INTEGER',},
                {name: 'message', type: 'TEXT',}
            ]
        })).run();
    }
}