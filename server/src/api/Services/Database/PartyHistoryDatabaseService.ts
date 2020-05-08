import { Service } from "typedi";
import { DatabaseService } from "./DatabaseService";
import { PartyHistoryDB } from "../../Types/DatabaseMaps/PartyHistoryDB";

@Service()
export class PartyHistoryDatabaseService {

    private readonly tableName: string = 'party_history';

    constructor(
        private databaseService: DatabaseService
    ) {
    }

    public async connect() {
        await this.buildTable();
    }

    public async insertHistory(historyObject: PartyHistoryDB): Promise<void> {
        await this.databaseService.insert({
            into: this.tableName,
            insert: historyObject
        });
    }

    public async removeHistoryForParty(partyId: string): Promise<void> {
        await this.databaseService.delete({
            from: this.tableName,
            where: [{key: 'partyId', operator: '=', value: partyId}]
        });
    }

    public async getAllHistory(): Promise<Array<PartyHistoryDB>> {
        return await this.databaseService.queryAll<PartyHistoryDB>({
            from: this.tableName,
            select: ['*']
        });
    }

    public async getHistoryForParty(partyId: string): Promise<Array<PartyHistoryDB>> {
        return await this.databaseService.queryAll<PartyHistoryDB>({
            from: this.tableName,
            select: ['*'],
            where: [{key: 'partyId', operator: '=', value: partyId}]
        });
    }

    private async buildTable(): Promise<void> {
        await this.databaseService.createTable({
            name: this.tableName,
            columns: [
                {name: 'partyId', type: 'TEXT', notNull: true, foreignKey: {table: 'parties', name: 'id'}},
                {name: 'name', type: 'TEXT', notNull: true},
                {name: 'artist', type: 'TEXT', notNull: true},
                {name: 'albumArtwork', type: 'TEXT', notNull: true},
                {name: 'spotifyId', type: 'TEXT', notNull: true},
                {name: 'votes', type: 'INTEGER'},
                {name: 'addedBy', type: 'TEXT'},
                {name: 'addedAt', type: 'BIGINT'},
                {name: 'playedAt', type: 'BIGINT', notNull: true},
                {name: 'acousticness', type: 'REAL'},
                {name: 'danceability', type: 'REAL'},
                {name: 'energy', type: 'REAL'},
                {name: 'instrumentalness', type: 'REAL'},
                {name: 'key', type: 'REAL'},
                {name: 'liveness', type: 'REAL'},
                {name: 'loudness', type: 'REAL'},
                {name: 'mode', type: 'REAL'},
                {name: 'speechiness', type: 'REAL'},
                {name: 'tempo', type: 'REAL'},
                {name: 'time_signature', type: 'REAL'},
                {name: 'valance', type: 'REAL'},
            ]
        });
    }
}