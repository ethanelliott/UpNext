import { PlaylistEntry } from "playlistEntry";
import { User } from "user";

export interface Party {
    name: string,
    code: string,
    start: number,
    backgroundColour: string,
    progressColour: string,
    adminPassword: string,
    token: string,
    refreshToken: string,
    tokenExpiry: number,
    userID: string,
    playlistID: string,
    playlist: Array<PlaylistEntry>;
    currentTrack: string,
    playState: boolean,
    users: Array<User>,
    voteSkipList: Array<string>,
    history: Array<string>
}

