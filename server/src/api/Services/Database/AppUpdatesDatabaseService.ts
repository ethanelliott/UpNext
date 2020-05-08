import { Service } from "typedi";
import { DatabaseService } from "./DatabaseService";
import { UpdateDB } from "../../Types/DatabaseMaps/UpdateDB";

@Service()
export class AppUpdatesDatabaseService {

    private readonly tableName: string = 'updates';

    constructor(
        private databaseService: DatabaseService
    ) {
    }

    public async connect() {
        await this.buildTable();
    }

    public async insertNewUpdate(update: UpdateDB): Promise<void> {
        await this.databaseService.insert({
            into: this.tableName,
            insert: update
        });
    }

    public async getAllUpdates(): Promise<Array<UpdateDB>> {
        return await this.databaseService.queryAll<UpdateDB>({
            from: this.tableName,
            select: ['*']
        });
    }

    public async deleteUpdateById(updateId: string) {
        await this.databaseService.delete({
            from: this.tableName,
            where: [{key: 'id', operator: '=', value: updateId}]
        });
    }

    private async buildTable() {
        await this.databaseService.createTable({
            name: this.tableName,
            columns: [
                {name: 'id', type: 'TEXT', unique: true, notNull: true, primaryKey: true},
                {name: 'title', type: 'TEXT',},
                {name: 'date', type: 'BIGINT',},
                {name: 'message', type: 'TEXT',}
            ]
        });
    }
}