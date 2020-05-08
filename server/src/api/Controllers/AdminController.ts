import 'reflect-metadata';
import { BodyParam, Get, JsonController, Param, Post } from 'routing-controllers';
import { AdminUserDatabaseService } from "../Services/Database/AdminUserDatabaseService";
import { UUIDService } from "../Services/UUIDService";
import { WebTokenService } from "../Services/WebTokenService";
import { PartyDatabaseService } from "../Services/Database/PartyDatabaseService";
import { PartyService } from "../Services/PartyService";
import { UpNextService } from "../Services/UpNextService";
import { UserDatabaseService } from "../Services/Database/UserDatabaseService";
import { UserDB } from "../Types/DatabaseMaps/UserDB";
import { UserEvent } from "../Factory/PartyEventEmitterBuilder";
import { PlaylistEntryDB } from "../Types/DatabaseMaps/PlaylistEntryDB";
import { PlaylistEntryDatabaseService } from "../Services/Database/PlaylistEntryDatabaseService";
import { AppUpdatesDatabaseService } from "../Services/Database/AppUpdatesDatabaseService";

@JsonController('/admin')
export class AdminController {
    constructor(
        private adminUserDatabaseService: AdminUserDatabaseService,
        private uuidService: UUIDService,
        private webTokenService: WebTokenService,
        private partyDatabaseService: PartyDatabaseService,
        private partyService: PartyService,
        private upNextService: UpNextService,
        private userDatabaseService: UserDatabaseService,
        private playlistEntryDatabaseService: PlaylistEntryDatabaseService,
        private appUpdatesDatabaseService: AppUpdatesDatabaseService
    ) {
    }

    @Post('/register')
    public async register(@BodyParam('username') username: string, @BodyParam('password') password: string): Promise<any> {
        if (await this.adminUserDatabaseService.getUserCount() === 0) {
            await this.adminUserDatabaseService.insertNewUser({
                id: this.uuidService.new(),
                username,
                password
            });
        }
        return {};
    }

    @Post('/login')
    public async login(@BodyParam('username') username: string, @BodyParam('password') password: string): Promise<any> {
        const user = await this.adminUserDatabaseService.getUserByUsername(username);
        if (user && user.password === password) {
            return {token: this.webTokenService.generateFrom({userId: user.id})};
        } else {
            throw new Error('Invalid Login');
        }
    }

    @Get('/parties')
    public async getAllParties(): Promise<any> {
        return await this.partyDatabaseService.getAllParties();
    }

    @Get('/party/:id')
    public async getPartyData(@Param('id') id: string): Promise<any> {
        return {
            party: await this.partyDatabaseService.getPartyById(id),
            playlist: await this.partyService.getPlaylistForPartyId(id),
            state: await this.upNextService.getPartyDataForPartyId(id),
            users: await this.userDatabaseService.getUsersAtParty(id)
        };
    }

    @Post('/party/notify')
    public async notifyParty(@BodyParam('title') title: string, @BodyParam('message') message: string, @BodyParam('partyId') partyId: string): Promise<any> {
        this.upNextService.emitNotificationToParty(partyId, title, message, []);
        return {};
    }

    @Post('/users/notify')
    public async notifyUser(@BodyParam('title') title: string, @BodyParam('message') message: string, @BodyParam('userId') userId: string): Promise<any> {
        this.upNextService.emitNotificationToUser(userId, title, message, []);
        return {};
    }

    @Post('/users/update')
    public async updateUser(@BodyParam('user') user: UserDB): Promise<any> {
        await this.userDatabaseService.updateUser(user);
        await this.partyService.emitUsersUpdate(user.partyId);
        this.upNextService.emitEventToUser(user.id, UserEvent.RELOAD);
        return {};
    }

    @Post('/users/delete')
    public async deleteUser(@BodyParam('user') user: UserDB): Promise<any> {
        await this.userDatabaseService.removeUserByUserId(user.id);
        await this.partyService.emitUsersUpdate(user.partyId);
        this.upNextService.emitEventToUser(user.id, UserEvent.LEAVE);
        return {};
    }

    @Post('/users/delete/all')
    public async deleteAllUsers(@BodyParam('partyId') partyId: string): Promise<any> {
        const users = await this.userDatabaseService.getUsersAtParty(partyId);
        users.forEach(user => {
            this.upNextService.emitEventToUser(user.id, UserEvent.LEAVE);
        });
        await this.userDatabaseService.removeAllUsersWithPartyId(partyId);
        await this.partyService.emitUsersUpdate(partyId);
        return {};
    }

    @Post('/users/reset')
    public async resetUserScores(@BodyParam('partyId') partyId: string): Promise<any> {
        await this.userDatabaseService.setUserScoreByParty(partyId, 0);
        await this.partyService.emitUsersUpdate(partyId);
        return {};
    }

    @Post('/playlist/entry/delete')
    public async deletePlaylistEntry(@BodyParam('entry') playlistEntry: PlaylistEntryDB): Promise<any> {
        await this.playlistEntryDatabaseService.removePlaylistEntryById(playlistEntry.id);
        this.partyService.emitPlaylistUpdate(playlistEntry.partyId);
        return {};
    }

    @Post('/party/users/refresh')
    public async forceEveryoneToRefresh(@BodyParam('partyId') partyId: string): Promise<any> {
        const users = await this.userDatabaseService.getUsersAtParty(partyId);
        users.forEach(user => {
            this.upNextService.emitEventToUser(user.id, UserEvent.RELOAD);
        });
        return {};
    }

    @Post('/party/users/leave')
    public async forceEveryoneToLeave(@BodyParam('partyId') partyId: string): Promise<any> {
        const users = await this.userDatabaseService.getUsersAtParty(partyId);
        users.forEach(user => {
            this.upNextService.emitEventToUser(user.id, UserEvent.LEAVE);
        });
        return {};
    }

    @Post('/party/delete')
    public async forceDeleteParty(@BodyParam('partyId') partyId: string): Promise<any> {
        const users = await this.userDatabaseService.getUsersAtParty(partyId);
        users.forEach(user => {
            this.upNextService.emitEventToUser(user.id, UserEvent.LEAVE);
        });
        await this.partyService.removePartyByPartyId(partyId);
        return {};
    }

    @Post('/updates/new')
    public async newUpdate(@BodyParam('title') title: string, @BodyParam('message') message: string, @BodyParam('date') date: number): Promise<any> {
        await this.appUpdatesDatabaseService.insertNewUpdate({
            id: this.uuidService.new(),
            date,
            title,
            message
        });
        return {};
    }

    @Post('/updates/delete')
    public async deleteUpdate(@BodyParam('updateId') updateId: string): Promise<any> {
        await this.appUpdatesDatabaseService.deleteUpdateById(updateId);
        return {};
    }
}