import Party from "../Types/Party";
import PartyPlayState from "../Types/PartyPlayState";
import PlaylistEntry from "../Types/PlaylistEntry";
import User from "../Types/User";
import VoteSkipEntry from "../Types/VoteSkipEntry";

export default class PartyBuilder {
    private name: string;
    private code: string;
    private id: string;
    private start: number;
    private token: string;
    private refreshToken: string;
    private tokenExpire: number;
    private userId: string;
    private playlistId: string;
    private playState: PartyPlayState;
    private playlist: Array<PlaylistEntry>;
    private users: Array<User>;
    private voteSkipList: Array<VoteSkipEntry>;

    constructor() {
    }

    private generateCode(): string {
        let ALL = "abcdefghijklmnpqrstuvwxyz1234567890".toUpperCase();
        let s = "";
        for (let i = 0; i < 4; i++) {
            s += ALL[Math.floor(Math.random() * ALL.length)];
        }
        return s;
    }

    public static make(): PartyBuilder {
        return new PartyBuilder();
    }

    public withName(name: string): PartyBuilder {
        this.name = name;
        return this;
    }

    public withCode(): PartyBuilder {
        this.code = this.generateCode();
        return this;
    }

    public withId(id: string): PartyBuilder {
        this.id = id;
        return this;
    }

    public withToken(token: string): PartyBuilder {
        this.token = token;
        return this;
    }

    public withRefreshToken(token: string): PartyBuilder {
        this.refreshToken = token;
        return this;
    }

    public withTokenExpire(expire: number): PartyBuilder {
        this.tokenExpire = expire;
        return this;
    }

    public withUserId(userId: string): PartyBuilder {
        this.userId = userId;
        return this;
    }

    public withPlaylistId(playlistId: string): PartyBuilder {
        this.playlistId = playlistId;
        return this;
    }

    public build(): Party {
        let p = new Party();
        p.name = this.name;
        p.code = this.code;
        p.id = this.id;
        p.start = this.start;
        p.token = this.token;
        p.refreshToken = this.refreshToken;
        p.tokenExpire = this.tokenExpire;
        p.userId = this.userId;
        p.playlistId = this.playlistId;
        p.playState = new PartyPlayState();
        p.playlist = new Array<PlaylistEntry>();
        p.users = new Array<User>();
        p.voteSkipList = new Array<VoteSkipEntry>();
        return p;
    }

}
