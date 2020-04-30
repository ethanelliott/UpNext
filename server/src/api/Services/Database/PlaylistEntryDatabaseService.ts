import { Service } from "typedi";
import { DatabaseService } from "./DatabaseService";
import QueryFactory from "../../Factory/QueryFactory";
import { PlaylistEntryDB } from "../../Types/DatabaseMaps/PlaylistEntryDB";
import { playlistSort } from "../sorts";

@Service()
export class PlaylistEntryDatabaseService {

    private readonly tableName: string = 'playlistEntry';

    constructor(
        private databaseService: DatabaseService
    ) {
        try {
            this.databaseService.db.prepare(`SELECT * FROM ${this.tableName}`).get();
        } catch (e) {
            this.buildTable();
        }
    }

    public insertPlaylistEntry(playlistEntry: PlaylistEntryDB): void {
        this.databaseService.insert({
            into: this.tableName,
            insert: playlistEntry
        });
    }

    public removePlaylistEntryById(playlistEntryId: string): void {
        this.databaseService.delete({
            from: this.tableName,
            where: [{key: 'id', operator: '=', value: playlistEntryId}]
        });
    }

    public removePlaylistEntryBySongId(partyId: string, spotifySongId: string): void {
        this.databaseService.delete({
            from: this.tableName,
            where: [
                {key: 'partyId', operator: '=', value: partyId},
                {key: 'spotifySongId', operator: '=', value: spotifySongId}
            ]
        });
    }

    public removePlaylistEntriesByPartyId(partyId: string): void {
        this.databaseService.delete({
            from: this.tableName,
            where: [{key: 'partyId', operator: '=', value: partyId}]
        });
    }

    public getAllPlaylistEntries(): Array<PlaylistEntryDB> {
        return this.databaseService.queryAll<PlaylistEntryDB>({
            from: this.tableName,
            select: ['*']
        });
    }

    public getPlaylistEntryById(playlistEntryId: string): PlaylistEntryDB {
        return this.databaseService.queryOne<PlaylistEntryDB>({
            from: this.tableName,
            select: ['*'],
            where: [{key: 'id', operator: '=', value: playlistEntryId}]
        });
    }

    public getEntriesForParty(partyId: string): Array<PlaylistEntryDB> {
        return this.databaseService.queryAll<PlaylistEntryDB>({
            from: this.tableName,
            select: ['*'],
            where: [{key: 'partyId', operator: '=', value: partyId}]
        });
    }

    public getAllPlaylistEntriesForParty(partyId: string): Array<PlaylistEntryDB> {
        return this.getEntriesForParty(partyId).sort(playlistSort);
    }

    public getAllPlaylistEntriesByUser(userId: string): Array<PlaylistEntryDB> {
        return this.databaseService.queryAll<PlaylistEntryDB>({
            from: this.tableName,
            select: ['*'],
            where: [{key: 'addedBy', operator: '=', value: userId}]
        });
    }

    public doesEntryExist(partyId: string, spotifySongId: string): boolean {
        const playlist = this.databaseService.queryAll<PlaylistEntryDB>({
            from: this.tableName,
            select: ['*'],
            where: [
                {key: 'partyId', operator: '=', value: partyId},
                {key: 'spotifySongId', operator: '=', value: spotifySongId}
            ]
        });
        return playlist.length === 1;
    }

    public addUpVote(playlistEntryId: string) {
        const entry = this.getPlaylistEntryById(playlistEntryId);
        this.databaseService.update({
            update: this.tableName,
            set: {
                UpVotes: entry.UpVotes + 1
            },
            where: [{key: 'id', operator: '=', value: playlistEntryId}]
        });
    }

    public removeUpVote(playlistEntryId: string) {
        const entry = this.getPlaylistEntryById(playlistEntryId);
        this.databaseService.update({
            update: this.tableName,
            set: {
                UpVotes: entry.UpVotes - 1
            },
            where: [{key: 'id', operator: '=', value: playlistEntryId}]
        });
    }

    public addDownVote(playlistEntryId: string) {
        const entry = this.getPlaylistEntryById(playlistEntryId);
        this.databaseService.update({
            update: this.tableName,
            set: {
                DownVotes: entry.DownVotes + 1
            },
            where: [{key: 'id', operator: '=', value: playlistEntryId}]
        });
    }

    public removeDownVote(playlistEntryId: string) {
        let entry = this.getPlaylistEntryById(playlistEntryId);
        this.databaseService.update({
            update: this.tableName,
            set: {
                DownVotes: entry.DownVotes - 1
            },
            where: [{key: 'id', operator: '=', value: playlistEntryId}]
        });
    }

    private buildTable() {
        this.databaseService.db.prepare(QueryFactory.buildCreateFrom({
            name: this.tableName,
            columns: [
                {name: 'id', type: 'TEXT', unique: true, notNull: true, primaryKey: true},
                {name: 'name', type: 'TEXT', notNull: true},
                {name: 'artist', type: 'TEXT', notNull: true},
                {name: 'albumArtwork', type: 'TEXT', notNull: true},
                {name: 'addedBy', type: 'TEXT', notNull: true, foreignKey: {table: 'users', name: 'id'}},
                {name: 'addedAt', type: 'INTEGER', notNull: true},
                {name: 'partyId', type: 'TEXT', notNull: true, foreignKey: {table: 'parties', name: 'id'}},
                {name: 'spotifySongId', type: 'TEXT', notNull: true},
                {name: 'UpVotes', type: 'INTEGER', notNull: true},
                {name: 'DownVotes', type: 'INTEGER', notNull: true},
            ]
        })).run();
    }

    public removePlaylistEntryByUserId(userId: string) {
        this.databaseService.delete({
            from: this.tableName,
            where: [{key: 'addedBy', operator: '=', value: userId}]
        });
    }

    public removePlaylistEntry(partyId: string, userId: string, songId: string) {
        this.databaseService.delete({
            from: this.tableName,
            where: [
                {key: 'partyId', operator: '=', value: partyId},
                {key: 'spotifySongId', operator: '=', value: songId},
                {key: 'addedBy', operator: '=', value: userId}
            ]
        });
    }
}