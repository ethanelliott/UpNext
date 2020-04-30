import { Service } from "typedi";
import { DatabaseService } from "./DatabaseService";
import QueryFactory from "../../Factory/QueryFactory";
import { PartyHistoryDB } from "../../Types/DatabaseMaps/PartyHistoryDB";

@Service()
export class PartyHistoryDatabaseService {

    private readonly tableName: string = 'partyHistory';

    constructor(
        private databaseService: DatabaseService
    ) {
        try {
            this.databaseService.db.prepare(`SELECT * FROM ${this.tableName}`).get();
        } catch (e) {
            this.buildTable();
        }
    }

    public insertHistory(historyObject: PartyHistoryDB): void {
        this.databaseService.insert({
            into: this.tableName,
            insert: historyObject
        });
    }

    public removeHistoryForParty(partyId: string): void {
        this.databaseService.delete({
            from: this.tableName,
            where: [{key: 'partyId', operator: '=', value: partyId}]
        });
    }

    public getAllHistory(): Array<PartyHistoryDB> {
        return this.databaseService.queryAll<PartyHistoryDB>({
            from: this.tableName,
            select: ['*']
        });
    }

    public getHistoryForParty(partyId: string): Array<PartyHistoryDB> {
        return this.databaseService.queryAll<PartyHistoryDB>({
            from: this.tableName,
            select: ['*'],
            where: [{key: 'partyId', operator: '=', value: partyId}]
        });
    }

    private buildTable(): void {
        this.databaseService.db.prepare(QueryFactory.buildCreateFrom({
            name: this.tableName,
            columns: [
                {name: 'partyId', type: 'TEXT', notNull: true, foreignKey: {table: 'parties', name: 'id'}},
                {name: 'name', type: 'TEXT', notNull: true},
                {name: 'artist', type: 'TEXT', notNull: true},
                {name: 'albumArtwork', type: 'TEXT', notNull: true},
                {name: 'spotifyId', type: 'TEXT', notNull: true},
                {name: 'votes', type: 'INTEGER'},
                {name: 'addedBy', type: 'TEXT'},
                {name: 'addedAt', type: 'INTEGER'},
                {name: 'playedAt', type: 'INTEGER', notNull: true},
                {name: 'acousticness', type: 'INTEGER'},
                {name: 'danceability', type: 'INTEGER'},
                {name: 'energy', type: 'INTEGER'},
                {name: 'instrumentalness', type: 'INTEGER'},
                {name: 'key', type: 'INTEGER'},
                {name: 'liveness', type: 'INTEGER'},
                {name: 'loudness', type: 'INTEGER'},
                {name: 'mode', type: 'INTEGER'},
                {name: 'speechiness', type: 'INTEGER'},
                {name: 'tempo', type: 'INTEGER'},
                {name: 'time_signature', type: 'INTEGER'},
                {name: 'valance', type: 'INTEGER'},
            ]
        })).run();
    }
}