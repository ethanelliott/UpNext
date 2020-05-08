import { Service } from "typedi";
import { DatabaseService } from "./DatabaseService";
import { NewPartyDB } from "../../Types/DatabaseMaps/NewPartyDB";

@Service()
export class NewPartyDatabaseService {

    private readonly tableName: string = 'new_parties';

    constructor(
        private databaseService: DatabaseService
    ) {
    }

    public async connect() {
        await this.buildTable();
    }

    public async insert(partyId: string, token: string) {
        await this.databaseService.insert({
            into: this.tableName,
            insert: {partyId, token}
        });
    }

    public async delete(partyId: string) {
        await this.databaseService.delete({
            from: this.tableName,
            where: [{key: 'partyId', operator: '=', value: partyId}]
        });
    }

    public async get(partyId: string): Promise<NewPartyDB> {
        return await this.databaseService.queryOne<NewPartyDB>({
            from: this.tableName,
            select: ['*'],
            where: [{key: 'partyId', operator: '=', value: partyId}]
        });
    }

    private async buildTable() {
        await this.databaseService.createTable({
            name: this.tableName,
            columns: [
                {name: 'partyId', type: 'TEXT', notNull: true},
                {name: 'token', type: 'TEXT', notNull: true}
            ]
        });
    }
}