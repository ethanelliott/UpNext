import { Service } from "typedi";
import { DatabaseService } from "./DatabaseService";
import QueryFactory from "../../Factory/QueryFactory";
import { UserDB } from "../../Types/DatabaseMaps/UserDB";

@Service()
export class UserDatabaseService {

    private readonly tableName: string = 'users';

    constructor(
        private databaseService: DatabaseService,
    ) {
        try {
            this.databaseService.db.prepare(`SELECT * FROM ${this.tableName}`).get();
        } catch (e) {
            this.buildTable();
        }
    }

    public insertUser(user: UserDB): void {
        this.databaseService.insert({
            into: this.tableName,
            insert: user
        });
    }

    public getAllUsers(): Array<UserDB> {
        return this.databaseService.queryAll<UserDB>({
            from: this.tableName,
            select: ['*']
        });
    }

    public updateUser(user: UserDB): void {
        this.databaseService.update({
            update: this.tableName,
            set: user,
            where: [{key: 'id', operator: '=', value: user.id}]
        });
    }

    public updateUserScore(userId: string, modifier: number): void {
        this.databaseService.update({
            update: this.tableName,
            set: {
                score: this.getUserById(userId).score + modifier
            },
            where: [{key: 'id', operator: '=', value: userId}]
        });
    }

    public getUsersAtParty(partyId: string): Array<UserDB> {
        return this.databaseService.queryAll<UserDB>({
            from: this.tableName,
            select: ['*'],
            where: [{key: 'partyId', operator: '=', value: partyId}]
        });
    }

    public getUserById(userId: string): UserDB {
        return this.databaseService.queryOne<UserDB>({
            from: this.tableName,
            select: ['*'],
            where: [{key: 'id', operator: '=', value: userId}]
        });
    }

    public removeAllUsersWithPartyId(partyId: string) {
        this.databaseService.delete({
            from: this.tableName,
            where: [{key: 'partyId', operator: '=', value: partyId}]
        });
    }

    public removeUserByUserId(userId: string) {
        this.databaseService.delete({
            from: this.tableName,
            where: [{key: 'id', operator: '=', value: userId}]
        });
    }

    public getUserByTrackingId(trackingId: string): Array<UserDB> {
        return this.databaseService.queryAll<UserDB>({
            from: this.tableName,
            select: ['*'],
            where: [{key: 'trackingId', operator: '=', value: trackingId}]
        });
    }

    public removeUserByTrackingId(trackingId: string) {
        this.databaseService.delete({
            from: this.tableName,
            where: [{key: 'trackingId', operator: '=', value: trackingId}]
        });
    }

    private buildTable() {
        this.databaseService.db.prepare(QueryFactory.buildCreateFrom({
            name: this.tableName,
            columns: [
                {name: 'id', type: 'TEXT', unique: true, notNull: true, primaryKey: true},
                {name: 'nickname', type: 'TEXT', notNull: true},
                {name: 'score', type: 'INTEGER', notNull: true},
                {name: 'partyId', type: 'TEXT', notNull: true, foreignKey: {name: 'id', table: 'parties'}},
                {name: 'joinedAt', type: 'INTEGER', notNull: true},
                {name: 'spotifyToken', type: 'TEXT'},
                {name: 'spotifyRefreshToken', type: 'TEXT'},
                {name: 'spotifyTokenExpire', type: 'INTEGER'},
                {
                    name: 'userPermission',
                    type: 'INTEGER',
                    notNull: true,
                    defaultValue: 0,
                    foreignKey: {table: 'userPermissions', name: 'id'}
                },
                {name: 'trackingId', type: 'TEXT', notNull: true, foreignKey: {name: 'id', table: 'userTracking'}},
            ]
        })).run();
    }

    public setUserScore(userId: any, score: number) {
        this.databaseService.update({
            update: this.tableName,
            set: {
                score: score
            },
            where: [{key: 'id', operator: '=', value: userId}]
        });
    }

    public setUserScoreByParty(partyId: any, score: number) {
        this.databaseService.update({
            update: this.tableName,
            set: {
                score: score
            },
            where: [{key: 'partyId', operator: '=', value: partyId}]
        });
    }

}