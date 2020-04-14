import { Service } from "typedi";
import { DatabaseService } from "./DatabaseService";
import QueryFactory from "../../Factory/QueryFactory";
import { NewPartyDB } from "../../Types/DatabaseMaps/NewPartyDB";

@Service()
export class NewPartyDatabaseService {

    private readonly tableName: string = 'newParties';

    constructor(
        private databaseService: DatabaseService
    ) {
        try {
            this.databaseService.db.prepare(`SELECT * FROM ${this.tableName}`).get();
        } catch (e) {
            this.buildTable();
        }
    }

    public insert(partyId: string, token: string) {
        this.databaseService.insert({
            into: this.tableName,
            insert: {partyId, token}
        });
    }

    public delete(partyId: string) {
        this.databaseService.delete({
            from: this.tableName,
            where: [{key: 'partyId', operator: '=', value: partyId}]
        });
    }

    public get(partyId: string): NewPartyDB {
        return this.databaseService.queryOne<NewPartyDB>({
            from: this.tableName,
            select: ['*'],
            where: [{key: 'partyId', operator: '=', value: partyId}]
        });
    }

    private buildTable() {
        this.databaseService.db.prepare(QueryFactory.buildCreateFrom({
            name: this.tableName,
            columns: [
                {name: 'partyId', type: 'TEXT', notNull: true},
                {name: 'token', type: 'TEXT', notNull: true}
            ]
        })).run();
    }
}