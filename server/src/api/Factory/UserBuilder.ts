import { UserDB } from "../Types/DatabaseMaps/UserDB";
import { UserPermissionEnum } from "../Types/Enums/UserPermissionEnum";
import moment from "moment";


export class UserBuilder {
    private nickname: string;
    private id: string;
    private score: number = 0;
    private partyId: string;
    private permission: UserPermissionEnum = UserPermissionEnum.DEFAULT;

    constructor() {
    }

    public static make(): UserBuilder {
        return new UserBuilder();
    }

    public withName(nickname: string): UserBuilder {
        this.nickname = nickname;
        return this;
    }

    public withId(id: string): UserBuilder {
        this.id = id;
        return this;
    }

    public withScore(score: number): UserBuilder {
        this.score = score;
        return this;
    }

    public withPartyId(partyId: string): UserBuilder {
        this.partyId = partyId;
        return this;
    }

    public withPermission(permission: UserPermissionEnum): UserBuilder {
        this.permission = permission;
        return this;
    }

    public build(): UserDB {
        let p = new UserDB();
        p.nickname = this.nickname;
        p.id = this.id;
        p.score = this.score;
        p.partyId = this.partyId;
        p.joinedAt = moment().valueOf();
        p.userPermission = this.permission;
        p.spotifyToken = '';
        p.spotifyRefreshToken = '';
        p.spotifyTokenExpire = 0;
        return p;
    }

}
