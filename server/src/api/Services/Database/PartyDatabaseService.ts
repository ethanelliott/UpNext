import { Service } from "typedi";
import { DatabaseService } from "./DatabaseService";
import QueryFactory from "../../Factory/QueryFactory";
import { PartyDB } from "../../Types/DatabaseMaps/PartyDB";
import moment from "moment";

@Service()
export class PartyDatabaseService {

    private readonly tableName: string = 'parties';

    constructor(
        private databaseService: DatabaseService
    ) {
        try {
            this.databaseService.db.prepare(`SELECT * FROM ${this.tableName}`).get();
        } catch (e) {
            this.buildTable();
        }
    }

    public insertParty(party: PartyDB) {
        this.databaseService.insert({
            into: this.tableName,
            insert: party
        });
    }

    public updateParty(party: PartyDB): void {
        this.databaseService.update({
            update: this.tableName,
            set: party,
            where: [{key: 'id', operator: '=', value: party.id}]
        });
    }

    public removePartyByPartyId(partyId: string) {
        this.databaseService.delete({
            from: this.tableName,
            where: [{key: 'id', operator: '=', value: partyId}]
        });
    }

    public removePartyBySpotifyUserId(spotifyUserId: string) {
        this.databaseService.delete({
            from: this.tableName,
            where: [{key: 'spotifyUserId', operator: '=', value: spotifyUserId}]
        });
    }

    public getAllParties(): Array<PartyDB> {
        return this.databaseService.queryAll<PartyDB>({
            from: this.tableName,
            select: ['*']
        });
    }

    public getPartyById(partyId: string): PartyDB {
        return this.databaseService.queryOne<PartyDB>({
            from: this.tableName,
            select: ['*'],
            where: [{key: 'id', operator: '=', value: partyId}]
        });
    }

    public getPartyByCode(partyCode: string): PartyDB {
        return this.databaseService.queryOne<PartyDB>({
            from: this.tableName,
            select: ['*'],
            where: [{key: 'code', operator: '=', value: partyCode}]
        });
    }

    public doesPartyExistById(partyId: string): boolean {
        return this.databaseService.queryAll<PartyDB>({
            from: this.tableName,
            select: ['id'],
            where: [{key: 'id', operator: '=', value: partyId}]
        }).length === 1;
    }

    public getPartyBySpotifyUserId(spotifyUserId: string): PartyDB {
        return this.databaseService.queryOne<PartyDB>({
            from: this.tableName,
            select: ['*'],
            where: [{key: 'spotifyUserId', operator: '=', value: spotifyUserId}]
        });
    }

    public getPartyIdByCode(code: string): PartyDB {
        return this.databaseService.queryOne<PartyDB>({
            from: this.tableName,
            select: ['id'],
            where: [{key: 'code', operator: '=', value: code}]
        });
    }

    public refreshPartyToken(partyId: string, access_token: string, expires_in: number) {
        const spotifyTokenExpire = moment().valueOf() + (1000 * expires_in);
        this.databaseService.update({
            update: this.tableName,
            set: {
                spotifyToken: access_token,
                spotifyTokenExpire
            },
            where: [{key: 'id', operator: '=', value: partyId}]
        });
    }

    private buildTable() {
        this.databaseService.db.prepare(QueryFactory.buildCreateFrom({
            name: this.tableName,
            columns: [
                {name: 'id', type: 'TEXT', unique: true, notNull: true, primaryKey: true},
                {name: 'name', type: 'TEXT', notNull: true},
                {name: 'code', type: 'TEXT', notNull: true},
                {name: 'startTime', type: 'INTEGER', notNull: true},
                {name: 'spotifyToken', type: 'TEXT', notNull: true},
                {name: 'spotifyRefreshToken', type: 'TEXT', notNull: true},
                {name: 'spotifyTokenExpire', type: 'INTEGER', notNull: true},
                {name: 'spotifyUserId', type: 'TEXT', notNull: true},
                {name: 'spotifyPlaylistId', type: 'TEXT', notNull: true}
            ]
        })).run();
    }
}