import { Service } from "typedi";
import { DatabaseService } from "./DatabaseService";
import QueryFactory from "../../Factory/QueryFactory";
import { PlaylistVotesDB } from "../../Types/DatabaseMaps/PlaylistVotesDB";
import { PlaylistVoteEnum } from "../../Types/Enums/PlaylistVoteEnum";

@Service()
export class PlaylistVoteDatabaseService {

    private readonly tableName: string = 'playlistVotes';

    constructor(
        private databaseService: DatabaseService
    ) {
        try {
            this.databaseService.db.prepare(`SELECT * FROM ${this.tableName}`).get();
        } catch (e) {
            this.buildTable();
        }
    }

    public insertVote(vote: PlaylistVotesDB): void {
        this.databaseService.insert({
            into: this.tableName,
            insert: vote
        });
    }

    public updateVote(playlistEntryId: string, userId: string, type: PlaylistVoteEnum): void {
        this.databaseService.update({
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

    public deleteVotesForEntry(playlistEntryId: string): void {
        this.databaseService.delete({
            from: this.tableName,
            where: [{key: 'playlistEntryId', operator: '=', value: playlistEntryId}]
        });
    }

    public getVotesForEntry(playlistEntryId: string): Array<PlaylistVotesDB> {
        return this.databaseService.queryAll<PlaylistVotesDB>({
            from: this.tableName,
            select: ['*'],
            where: [{key: 'playlistEntryId', operator: '=', value: playlistEntryId}]
        });
    }

    public getVotesForUser(userId: string): Array<PlaylistVotesDB> {
        return this.databaseService.queryAll<PlaylistVotesDB>({
            from: this.tableName,
            select: ['*'],
            where: [{key: 'userId', operator: '=', value: userId}]
        });
    }

    public getVotesForUserOnEntry(userId: string, playlistEntryId: string): Array<PlaylistVotesDB> {
        return this.databaseService.queryAll<PlaylistVotesDB>({
            from: this.tableName,
            select: ['*'],
            where: [
                {key: 'userId', operator: '=', value: userId},
                {key: 'playlistEntryId', operator: '=', value: playlistEntryId}
            ]
        });
    }

    public deleteVote(playlistEntryId: string, userId: string) {
        this.databaseService.delete({
            from: this.tableName,
            where: [
                {key: 'playlistEntryId', operator: '=', value: playlistEntryId},
                {key: 'userId', operator: '=', value: userId}
            ]
        });
    }

    private buildTable() {
        this.databaseService.db.prepare(QueryFactory.buildCreateFrom({
            name: this.tableName,
            columns: [
                {name: 'userId', type: 'TEXT', notNull: true, foreignKey: {table: 'users', name: 'id'}},
                {
                    name: 'playlistEntryId',
                    type: 'TEXT',
                    notNull: true,
                    foreignKey: {table: 'playlistEntry', name: 'id'}
                },
                {name: 'type', type: 'INTEGER'}
            ]
        })).run();
    }

    public deleteVotesForUser(userId: string) {
        this.databaseService.delete({
            from: this.tableName,
            where: [
                {key: 'userId', operator: '=', value: userId}
            ]
        });
    }
}