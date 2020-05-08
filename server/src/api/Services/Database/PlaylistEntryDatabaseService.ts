import { Service } from "typedi";
import { DatabaseService } from "./DatabaseService";
import { PlaylistEntryDB } from "../../Types/DatabaseMaps/PlaylistEntryDB";
import { playlistSort } from "../sorts";

@Service()
export class PlaylistEntryDatabaseService {

    private readonly tableName: string = 'playlist_entry';

    constructor(
        private databaseService: DatabaseService
    ) {
    }

    public async connect() {
        await this.buildTable();
    }

    public async insertPlaylistEntry(playlistEntry: PlaylistEntryDB): Promise<void> {
        await this.databaseService.insert({
            into: this.tableName,
            insert: playlistEntry
        });
    }

    public async removePlaylistEntryById(playlistEntryId: string): Promise<void> {
        await this.databaseService.delete({
            from: this.tableName,
            where: [{key: 'id', operator: '=', value: playlistEntryId}]
        });
    }

    public async removePlaylistEntryBySongId(partyId: string, spotifySongId: string): Promise<void> {
        await this.databaseService.delete({
            from: this.tableName,
            where: [
                {key: 'partyId', operator: '=', value: partyId},
                {key: 'spotifySongId', operator: '=', value: spotifySongId}
            ]
        });
    }

    public async removePlaylistEntriesByPartyId(partyId: string): Promise<void> {
        await this.databaseService.delete({
            from: this.tableName,
            where: [{key: 'partyId', operator: '=', value: partyId}]
        });
    }

    public async getAllPlaylistEntries(): Promise<Array<PlaylistEntryDB>> {
        return await this.databaseService.queryAll<PlaylistEntryDB>({
            from: this.tableName,
            select: ['*']
        });
    }

    public async getPlaylistEntryById(playlistEntryId: string): Promise<PlaylistEntryDB> {
        return await this.databaseService.queryOne<PlaylistEntryDB>({
            from: this.tableName,
            select: ['*'],
            where: [{key: 'id', operator: '=', value: playlistEntryId}]
        });
    }

    public async getEntriesForParty(partyId: string): Promise<Array<PlaylistEntryDB>> {
        return await this.databaseService.queryAll<PlaylistEntryDB>({
            from: this.tableName,
            select: ['*'],
            where: [{key: 'partyId', operator: '=', value: partyId}]
        });
    }

    public async getAllPlaylistEntriesForParty(partyId: string): Promise<Array<PlaylistEntryDB>> {
        const playlist = await this.getEntriesForParty(partyId);
        return playlist.sort(playlistSort);
    }

    public async getAllPlaylistEntriesByUser(userId: string): Promise<Array<PlaylistEntryDB>> {
        return await this.databaseService.queryAll<PlaylistEntryDB>({
            from: this.tableName,
            select: ['*'],
            where: [{key: 'addedBy', operator: '=', value: userId}]
        });
    }

    public async doesEntryExist(partyId: string, spotifySongId: string): Promise<boolean> {
        const playlist = await this.databaseService.queryAll<PlaylistEntryDB>({
            from: this.tableName,
            select: ['*'],
            where: [
                {key: 'partyId', operator: '=', value: partyId},
                {key: 'spotifySongId', operator: '=', value: spotifySongId}
            ]
        });
        return playlist.length === 1;
    }

    public async addUpVote(playlistEntryId: string) {
        const entry = await this.getPlaylistEntryById(playlistEntryId);
        await this.databaseService.update({
            update: this.tableName,
            set: {
                UpVotes: entry.UpVotes + 1
            },
            where: [{key: 'id', operator: '=', value: playlistEntryId}]
        });
    }

    public async removeUpVote(playlistEntryId: string) {
        const entry = await this.getPlaylistEntryById(playlistEntryId);
        await this.databaseService.update({
            update: this.tableName,
            set: {
                UpVotes: entry.UpVotes - 1
            },
            where: [{key: 'id', operator: '=', value: playlistEntryId}]
        });
    }

    public async addDownVote(playlistEntryId: string) {
        const entry = await this.getPlaylistEntryById(playlistEntryId);
        await this.databaseService.update({
            update: this.tableName,
            set: {
                DownVotes: entry.DownVotes + 1
            },
            where: [{key: 'id', operator: '=', value: playlistEntryId}]
        });
    }

    public async removeDownVote(playlistEntryId: string) {
        let entry = await this.getPlaylistEntryById(playlistEntryId);
        await this.databaseService.update({
            update: this.tableName,
            set: {
                DownVotes: entry.DownVotes - 1
            },
            where: [{key: 'id', operator: '=', value: playlistEntryId}]
        });
    }

    public async removePlaylistEntryByUserId(userId: string) {
        await this.databaseService.delete({
            from: this.tableName,
            where: [{key: 'addedBy', operator: '=', value: userId}]
        });
    }

    public async removePlaylistEntry(partyId: string, userId: string, songId: string) {
        await this.databaseService.delete({
            from: this.tableName,
            where: [
                {key: 'partyId', operator: '=', value: partyId},
                {key: 'spotifySongId', operator: '=', value: songId},
                {key: 'addedBy', operator: '=', value: userId}
            ]
        });
    }

    private async buildTable() {
        await this.databaseService.createTable({
            name: this.tableName,
            columns: [
                {name: 'id', type: 'TEXT', unique: true, notNull: true, primaryKey: true},
                {name: 'name', type: 'TEXT', notNull: true},
                {name: 'artist', type: 'TEXT', notNull: true},
                {name: 'albumArtwork', type: 'TEXT', notNull: true},
                {name: 'addedBy', type: 'TEXT', notNull: true, foreignKey: {table: 'users', name: 'id'}},
                {name: 'addedAt', type: 'BIGINT', notNull: true},
                {name: 'partyId', type: 'TEXT', notNull: true, foreignKey: {table: 'parties', name: 'id'}},
                {name: 'spotifySongId', type: 'TEXT', notNull: true},
                {name: 'UpVotes', type: 'INTEGER', notNull: true},
                {name: 'DownVotes', type: 'INTEGER', notNull: true},
            ]
        });
    }
}