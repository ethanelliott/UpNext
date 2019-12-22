import User from "./User";
import PlaylistEntry from "./PlaylistEntry";
import VoteSkipEntry from "./VoteSkipEntry";
import PartyPlayState from "./PartyPlayState";
import { PartyStateEnum } from "./PartyStateEnum";

export default class Party {
    //db
    _id: string;
    // generic
    name: string;
    code: string;
    id: string;
    start: number;

    // spotify things
    token: string;
    refreshToken: string;
    tokenExpire: number;

    // spotify user info
    userId: string;
    playlistId: string;

    // upnext party info
    state: PartyStateEnum;
    previousSong: string;
    playState: PartyPlayState;
    playlist: Array<PlaylistEntry>;
    users: Array<User>;
    voteSkipList: Array<VoteSkipEntry>;
    history: Array<string>;
}
