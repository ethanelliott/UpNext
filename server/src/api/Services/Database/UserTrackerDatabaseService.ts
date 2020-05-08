import { Service } from "typedi";
import { DatabaseService } from "./DatabaseService";

@Service()
export class UserTrackerDatabaseService {

    private readonly tableName: string = 'user_tracking';

    constructor(
        private databaseService: DatabaseService
    ) {
    }

    public async connect() {
        await this.buildTable();
    }

    public async insertNewUser(trackingId: string, now: number, userAgent: string) {
        await this.databaseService.insert({
            into: this.tableName,
            insert: {
                id: trackingId,
                firstSeen: now,
                lastSeen: now,
                userAgent
            }
        });
    }

    public async updateLastSeen(trackingId: string, now: number) {
        await this.databaseService.update({
            update: this.tableName,
            set: {lastSeen: now},
            where: [{key: 'id', operator: '=', value: trackingId}]
        });
    }

    public async doesTrackingIdExist(trackingId: string): Promise<boolean> {
        const trackers = await this.databaseService.queryAll({
            from: this.tableName,
            select: ['*'],
            where: [{key: 'id', operator: '=', value: trackingId}]
        });
        return trackers.length === 1;
    }

    private async buildTable() {
        await this.databaseService.createTable({
            name: this.tableName,
            columns: [
                {name: 'id', type: 'TEXT', unique: true, notNull: true, primaryKey: true},
                {name: 'firstSeen', type: 'BIGINT',},
                {name: 'lastSeen', type: 'BIGINT',},
                {name: 'userAgent', type: 'TEXT',}
            ]
        });
    }
}