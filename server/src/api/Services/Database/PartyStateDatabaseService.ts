import { Service } from "typedi";
import { DatabaseService } from "./DatabaseService";
import QueryFactory from "../../Factory/QueryFactory";
import { PartyStateDB } from "../../Types/DatabaseMaps/PartyStateDB";
import { PartyStateEnum } from "../../Types/Enums/PartyStateEnum";

@Service()
export class PartyStateDatabaseService {

    private readonly tableName: string = 'partyState';

    constructor(
        private databaseService: DatabaseService
    ) {
        try {
            this.databaseService.db.prepare(`SELECT * FROM ${this.tableName}`).get();
        } catch (e) {
            this.buildTable();
        }
    }

    public insertPartyState(partyState: PartyStateDB): void {
        this.databaseService.insert({
            into: this.tableName,
            insert: partyState
        });
    }

    public updatePartyState(partyState: PartyStateDB): void {
        this.databaseService.update({
            update: this.tableName,
            set: partyState,
            where: [{key: 'partyId', operator: '=', value: partyState.partyId}]
        });
    }

    public removePartyStateByPartyId(partyId: string): void {
        this.databaseService.delete({
            from: this.tableName,
            where: [{key: 'partyId', operator: '=', value: partyId}]
        });
    }

    public getPartyStateById(stateId: string): PartyStateDB {
        return this.databaseService.queryOne({
            from: this.tableName,
            select: ['*'],
            where: [{key: 'id', operator: '=', value: stateId}]
        });
    }

    public getPartyStateByPartyId(partyId: string): PartyStateDB {
        return this.databaseService.queryOne({
            from: this.tableName,
            select: ['*'],
            where: [{key: 'partyId', operator: '=', value: partyId}]
        });
    }

    public updatePartyColours(partyId: string, colours: { darkVibrant: string; lightMuted: string; vibrant: string; darkMuted: string; muted: string; lightVibrant: string }): void {
        this.databaseService.update({
            update: this.tableName,
            where: [{key: 'partyId', operator: '=', value: partyId}],
            set: colours
        });
    }

    public updatePreviousSong(partyId: string, songId: string) {
        this.databaseService.update({
            update: this.tableName,
            where: [{key: 'partyId', operator: '=', value: partyId}],
            set: {previousTrackId: songId}
        });
    }

    public updatePartyStateValue(partyId: string, partyState: PartyStateEnum) {
        this.databaseService.update({
            update: this.tableName,
            where: [{key: 'partyId', operator: '=', value: partyId}],
            set: {state: partyState}
        });
    }

    public updatePartyStateProgress(id: string, progress: number) {
        this.databaseService.update({
            update: this.tableName,
            where: [{key: 'id', operator: '=', value: id}],
            set: {progress}
        });
    }

    private buildTable() {
        this.databaseService.db.prepare(QueryFactory.buildCreateFrom({
            name: this.tableName,
            columns: [
                {name: 'id', type: 'TEXT', unique: true, notNull: true, primaryKey: true},
                {name: 'partyId', type: 'TEXT', notNull: true, foreignKey: {table: 'parties', name: 'id'}},
                {name: 'state', type: 'INTEGER', notNull: true},
                {name: 'previousTrackId', type: 'TEXT'},
                {name: 'trackId', type: 'TEXT', notNull: true},
                {name: 'trackName', type: 'TEXT', notNull: true},
                {name: 'artistName', type: 'TEXT', notNull: true},
                {name: 'progress', type: 'INTEGER', notNull: true},
                {name: 'duration', type: 'INTEGER', notNull: true},
                {name: 'albumArtwork', type: 'TEXT', notNull: true},
                {name: 'addedBy', type: 'TEXT', notNull: true},
                {name: 'colourVibrant', type: 'TEXT', notNull: true},
                {name: 'colourMuted', type: 'TEXT', notNull: true},
                {name: 'colourDarkVibrant', type: 'TEXT', notNull: true},
                {name: 'colourDarkMuted', type: 'TEXT', notNull: true},
                {name: 'colourLightVibrant', type: 'TEXT', notNull: true},
                {name: 'colourLightMuted', type: 'TEXT', notNull: true},
            ]
        })).run();
    }
}