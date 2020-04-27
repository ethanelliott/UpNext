import { UserPermissionEnum } from "../Enums/UserPermissionEnum";

export class UserDB {
    id: string;
    nickname: string;
    score: number;
    partyId: string;
    joinedAt: number;
    spotifyToken: string;
    spotifyRefreshToken: string;
    spotifyTokenExpire: number;
    userPermission: UserPermissionEnum;
    trackingId: string;
}
