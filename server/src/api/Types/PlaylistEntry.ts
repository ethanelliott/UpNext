import User from "./User";

export default class PlaylistEntry {
    id: string;
    name: string;
    artist: string;
    albumArtwork: string;
    votes: number;
    added: User;
    addedAt: number;
    upVoters: Array<User>;
    downVoters: Array<User>;

}
