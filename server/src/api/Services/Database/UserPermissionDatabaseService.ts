import { Service } from "typedi";
import { DatabaseService } from "./DatabaseService";

@Service()
export class UserPermissionDatabaseService {

    private readonly tableName: string = 'user_permissions';

    constructor(
        private databaseService: DatabaseService
    ) {
    }

    public async connect() {
        await this.buildTable();
        await this.insetDefaultValues();
    }

    private async buildTable() {
        await this.databaseService.createTable({
            name: this.tableName,
            columns: [
                {name: 'id', type: 'INTEGER', unique: true, notNull: true, primaryKey: true},
                {name: 'name', type: 'TEXT', notNull: true}
            ]
        });
    }

    private async insetDefaultValues() {
        const data = await this.databaseService.queryAll({
            from: this.tableName,
            select: ['*']
        });
        if (data.length === 0) {
            await this.databaseService.insert({
                into: this.tableName,
                insert: {
                    id: 0,
                    name: 'default'
                }
            });
            await this.databaseService.insert({
                into: this.tableName,
                insert: {
                    id: 1,
                    name: 'admin'
                }
            });
        }
    }
}