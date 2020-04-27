import { Service } from "typedi";
import { DatabaseService } from "./DatabaseService";
import QueryFactory from "../../Factory/QueryFactory";

@Service()
export class UserTrackerDatabaseService {

    private readonly tableName: string = 'userTracking';

    constructor(
        private databaseService: DatabaseService
    ) {
        try {
            this.databaseService.db.prepare(`SELECT * FROM ${this.tableName}`).get();
        } catch (e) {
            this.buildTable();
        }
    }

    public insertNewUser(trackingId: string, now: number, userAgent: string) {
        this.databaseService.insert({
            into: this.tableName,
            insert: {
                id: trackingId,
                firstSeen: now,
                lastSeen: now,
                userAgent
            }
        });
    }

    public updateLastSeen(trackingId: string, now: number) {
        this.databaseService.update({
            update: this.tableName,
            set: {lastSeen: now},
            where: [{key: 'id', operator: '=', value: trackingId}]
        });
    }

    private buildTable() {
        this.databaseService.db.prepare(QueryFactory.buildCreateFrom({
            name: this.tableName,
            columns: [
                {name: 'id', type: 'TEXT', unique: true, notNull: true, primaryKey: true},
                {name: 'firstSeen', type: 'INTEGER',},
                {name: 'lastSeen', type: 'INTEGER',},
                {name: 'userAgent', type: 'TEXT',}
            ]
        })).run();
    }
}