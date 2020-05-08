import { Service } from "typedi";
import { DatabaseService } from "./DatabaseService";
import { PartyDB } from "../../Types/DatabaseMaps/PartyDB";
import moment from "moment";

@Service()
export class PartyDatabaseService {

    private readonly tableName: string = 'parties';

    constructor(
        private databaseService: DatabaseService
    ) {
    }

    public async connect() {
        await this.buildTable();
    }

    public async insertParty(party: PartyDB) {
        await this.databaseService.insert({
            into: this.tableName,
            insert: party
        });
    }

    public async updateParty(party: PartyDB): Promise<void> {
        await this.databaseService.update({
            update: this.tableName,
            set: party,
            where: [{key: 'id', operator: '=', value: party.id}]
        });
    }

    public async removePartyByPartyId(partyId: string) {
        await this.databaseService.delete({
            from: this.tableName,
            where: [{key: 'id', operator: '=', value: partyId}]
        });
    }

    public async removePartyBySpotifyUserId(spotifyUserId: string) {
        await this.databaseService.delete({
            from: this.tableName,
            where: [{key: 'spotifyUserId', operator: '=', value: spotifyUserId}]
        });
    }

    public async getAllParties(): Promise<Array<PartyDB>> {
        return await this.databaseService.queryAll<PartyDB>({
            from: this.tableName,
            select: ['*']
        });
    }

    public async getPartyById(partyId: string): Promise<PartyDB> {
        return this.databaseService.queryOne<PartyDB>({
            from: this.tableName,
            select: ['*'],
            where: [{key: 'id', operator: '=', value: partyId}]
        });
    }

    public async getPartyByCode(partyCode: string): Promise<PartyDB> {
        return this.databaseService.queryOne<PartyDB>({
            from: this.tableName,
            select: ['*'],
            where: [{key: 'code', operator: '=', value: partyCode}]
        });
    }

    public async doesPartyExistById(partyId: string): Promise<boolean> {
        const res = await this.databaseService.queryAll<PartyDB>({
            from: this.tableName,
            select: ['id'],
            where: [{key: 'id', operator: '=', value: partyId}]
        });
        return res.length === 1;
    }

    public async getPartyBySpotifyUserId(spotifyUserId: string): Promise<PartyDB> {
        return this.databaseService.queryOne<PartyDB>({
            from: this.tableName,
            select: ['*'],
            where: [{key: 'spotifyUserId', operator: '=', value: spotifyUserId}]
        });
    }

    public async getPartyIdByCode(code: string): Promise<PartyDB> {
        return this.databaseService.queryOne<PartyDB>({
            from: this.tableName,
            select: ['id'],
            where: [{key: 'code', operator: '=', value: code}]
        });
    }

    public async refreshPartyToken(partyId: string, access_token: string, expires_in: number) {
        const spotifyTokenExpire = moment().valueOf() + (1000 * expires_in);
        await this.databaseService.update({
            update: this.tableName,
            set: {
                spotifyToken: access_token,
                spotifyTokenExpire
            },
            where: [{key: 'id', operator: '=', value: partyId}]
        });
    }

    private async buildTable() {
        await this.databaseService.createTable({
            name: this.tableName,
            columns: [
                {name: 'id', type: 'TEXT', unique: true, notNull: true, primaryKey: true},
                {name: 'name', type: 'TEXT', notNull: true},
                {name: 'code', type: 'TEXT', notNull: true},
                {name: 'startTime', type: 'BIGINT', notNull: true},
                {name: 'spotifyToken', type: 'TEXT', notNull: true},
                {name: 'spotifyRefreshToken', type: 'TEXT', notNull: true},
                {name: 'spotifyTokenExpire', type: 'BIGINT', notNull: true},
                {name: 'spotifyUserId', type: 'TEXT', notNull: true},
                {name: 'spotifyPlaylistId', type: 'TEXT', notNull: true}
            ]
        });
    }
}