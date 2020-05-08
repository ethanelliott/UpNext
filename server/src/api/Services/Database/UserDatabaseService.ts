import { Service } from "typedi";
import { DatabaseService } from "./DatabaseService";
import { UserDB } from "../../Types/DatabaseMaps/UserDB";

@Service()
export class UserDatabaseService {

    private readonly tableName: string = 'users';

    constructor(
        private databaseService: DatabaseService,
    ) {
    }

    public async connect() {
        await this.buildTable();
    }

    public async insertUser(user: UserDB): Promise<void> {
        await this.databaseService.insert({
            into: this.tableName,
            insert: user
        });
    }

    public async getAllUsers(): Promise<Array<UserDB>> {
        return await this.databaseService.queryAll<UserDB>({
            from: this.tableName,
            select: ['*']
        });
    }

    public async updateUser(user: UserDB): Promise<void> {
        await this.databaseService.update({
            update: this.tableName,
            set: user,
            where: [{key: 'id', operator: '=', value: user.id}]
        });
    }

    public async updateUserScore(userId: string, modifier: number): Promise<void> {
        const user = await this.getUserById(userId);
        await this.databaseService.update({
            update: this.tableName,
            set: {
                score: user.score + modifier
            },
            where: [{key: 'id', operator: '=', value: userId}]
        });
    }

    public async getUsersAtParty(partyId: string): Promise<Array<UserDB>> {
        return await this.databaseService.queryAll<UserDB>({
            from: this.tableName,
            select: ['*'],
            where: [{key: 'partyId', operator: '=', value: partyId}]
        });
    }

    public async getUserById(userId: string): Promise<UserDB> {
        return await this.databaseService.queryOne<UserDB>({
            from: this.tableName,
            select: ['*'],
            where: [{key: 'id', operator: '=', value: userId}]
        });
    }

    public async removeAllUsersWithPartyId(partyId: string) {
        await this.databaseService.delete({
            from: this.tableName,
            where: [{key: 'partyId', operator: '=', value: partyId}]
        });
    }

    public async removeUserByUserId(userId: string) {
        await this.databaseService.delete({
            from: this.tableName,
            where: [{key: 'id', operator: '=', value: userId}]
        });
    }

    public async getUserByTrackingId(trackingId: string): Promise<Array<UserDB>> {
        return await this.databaseService.queryAll<UserDB>({
            from: this.tableName,
            select: ['*'],
            where: [{key: 'trackingId', operator: '=', value: trackingId}]
        });
    }

    public async removeUserByTrackingId(trackingId: string) {
        await this.databaseService.delete({
            from: this.tableName,
            where: [{key: 'trackingId', operator: '=', value: trackingId}]
        });
    }

    public async setUserScore(userId: any, score: number) {
        await this.databaseService.update({
            update: this.tableName,
            set: {
                score: score
            },
            where: [{key: 'id', operator: '=', value: userId}]
        });
    }

    public async setUserScoreByParty(partyId: any, score: number) {
        await this.databaseService.update({
            update: this.tableName,
            set: {
                score: score
            },
            where: [{key: 'partyId', operator: '=', value: partyId}]
        });
    }

    private async buildTable() {
        await this.databaseService.createTable({
            name: this.tableName,
            columns: [
                {name: 'id', type: 'TEXT', unique: true, notNull: true, primaryKey: true},
                {name: 'nickname', type: 'TEXT', notNull: true},
                {name: 'score', type: 'INTEGER', notNull: true},
                {name: 'partyId', type: 'TEXT', notNull: true, foreignKey: {name: 'id', table: 'parties'}},
                {name: 'joinedAt', type: 'BIGINT', notNull: true},
                {name: 'spotifyToken', type: 'TEXT'},
                {name: 'spotifyRefreshToken', type: 'TEXT'},
                {name: 'spotifyTokenExpire', type: 'BIGINT'},
                {
                    name: 'userPermission',
                    type: 'INTEGER',
                    notNull: true,
                    defaultValue: 0,
                    foreignKey: {table: 'user_permissions', name: 'id'}
                },
                {name: 'trackingId', type: 'TEXT', notNull: true, foreignKey: {name: 'id', table: 'user_tracking'}},
            ]
        });
    }
}