import { Service } from "typedi";
import { DatabaseService } from "./DatabaseService";
import { PlaylistVotesDB } from "../../Types/DatabaseMaps/PlaylistVotesDB";
import { PlaylistVoteEnum } from "../../Types/Enums/PlaylistVoteEnum";

@Service()
export class PlaylistVoteDatabaseService {

    private readonly tableName: string = 'playlist_votes';

    constructor(
        private databaseService: DatabaseService
    ) {
    }

    public async connect() {
        await this.buildTable();
    }

    public async insertVote(vote: PlaylistVotesDB): Promise<void> {
        await this.databaseService.insert({
            into: this.tableName,
            insert: vote
        });
    }

    public async updateVote(playlistEntryId: string, userId: string, type: PlaylistVoteEnum): Promise<void> {
        await this.databaseService.update({
            update: this.tableName,
            set: {
                type: type
            },
            where: [
                {key: 'userId', operator: '=', value: userId},
                {key: 'playlistEntryId', operator: '=', value: playlistEntryId}
            ]
        });
    }

    public async deleteVotesForEntry(playlistEntryId: string): Promise<void> {
        await this.databaseService.delete({
            from: this.tableName,
            where: [{key: 'playlistEntryId', operator: '=', value: playlistEntryId}]
        });
    }

    public async getVotesForEntry(playlistEntryId: string): Promise<Array<PlaylistVotesDB>> {
        return await this.databaseService.queryAll<PlaylistVotesDB>({
            from: this.tableName,
            select: ['*'],
            where: [{key: 'playlistEntryId', operator: '=', value: playlistEntryId}]
        });
    }

    public async getVotesForUser(userId: string): Promise<Array<PlaylistVotesDB>> {
        return await this.databaseService.queryAll<PlaylistVotesDB>({
            from: this.tableName,
            select: ['*'],
            where: [{key: 'userId', operator: '=', value: userId}]
        });
    }

    public async getVotesForUserOnEntry(userId: string, playlistEntryId: string): Promise<Array<PlaylistVotesDB>> {
        return await this.databaseService.queryAll<PlaylistVotesDB>({
            from: this.tableName,
            select: ['*'],
            where: [
                {key: 'userId', operator: '=', value: userId},
                {key: 'playlistEntryId', operator: '=', value: playlistEntryId}
            ]
        });
    }

    public async deleteVote(playlistEntryId: string, userId: string) {
        await this.databaseService.delete({
            from: this.tableName,
            where: [
                {key: 'playlistEntryId', operator: '=', value: playlistEntryId},
                {key: 'userId', operator: '=', value: userId}
            ]
        });
    }

    public async deleteVotesForUser(userId: string) {
        await this.databaseService.delete({
            from: this.tableName,
            where: [
                {key: 'userId', operator: '=', value: userId}
            ]
        });
    }

    private async buildTable() {
        await this.databaseService.createTable({
            name: this.tableName,
            columns: [
                {name: 'userId', type: 'TEXT', notNull: true, foreignKey: {table: 'users', name: 'id'}},
                {
                    name: 'playlistEntryId',
                    type: 'TEXT',
                    notNull: true,
                    foreignKey: {table: 'playlist_entry', name: 'id'}
                },
                {name: 'type', type: 'INTEGER'}
            ]
        });
    }
}