import { Service } from "typedi";
import { DatabaseService } from "./DatabaseService";
import { AdminUserDb } from "../../Types/DatabaseMaps/AdminUserDb";

@Service()
export class AdminUserDatabaseService {

    private readonly tableName: string = 'admin_users';

    constructor(
        private databaseService: DatabaseService
    ) {
    }

    public async connect() {
        await this.buildTable();
    }

    public async insertNewUser(username: AdminUserDb): Promise<void> {
        await this.databaseService.insert({
            into: this.tableName,
            insert: username
        });
    }

    public async getUserCount(): Promise<number> {
        const users = await this.databaseService.queryAll<AdminUserDb>({
            from: this.tableName,
            select: ['*'],
        });
        return users.length;
    }

    public async getUserByUsername(username: string): Promise<AdminUserDb> {
        return await this.databaseService.queryOne<AdminUserDb>({
            from: this.tableName,
            select: ['*'],
            where: [
                {key: 'username', operator: '=', value: username}
            ]
        });
    }

    private async buildTable() {
        await this.databaseService.createTable({
            name: this.tableName,
            columns: [
                {name: 'id', type: 'TEXT', unique: true, notNull: true, primaryKey: true},
                {name: 'username', type: 'TEXT', unique: true, notNull: true},
                {name: 'password', type: 'TEXT', unique: false, notNull: true},
            ]
        });
    }
}