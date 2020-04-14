import { UserPermissionEnum } from "../Enums/UserPermissionEnum";

export class UserDB {
    id: string;
    nickname: string;
    score: number;
    partyId: string;
    spotifyToken: string;
    spotifyRefreshToken: string;
    spotifyTokenExpire: number;
    userPermission: UserPermissionEnum;
}
