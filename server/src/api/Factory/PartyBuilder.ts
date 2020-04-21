import { PartyDB } from "../Types/DatabaseMaps/PartyDB";
import moment from "moment";

export class PartyBuilder {
    private id: string;
    private name: string;
    private code: string;
    private spotifyToken: string;
    private spotifyRefreshToken: string;
    private spotifyTokenExpire: number;
    private spotifyUserId: string;
    private spotifyPlaylistId: string;

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
        this.spotifyToken = token;
        return this;
    }

    public withRefreshToken(refreshToken: string): PartyBuilder {
        this.spotifyRefreshToken = refreshToken;
        return this;
    }

    public withTokenExpire(expire: number): PartyBuilder {
        this.spotifyTokenExpire = expire;
        return this;
    }

    public withUserId(userId: string): PartyBuilder {
        this.spotifyUserId = userId;
        return this;
    }

    public withPlaylistId(playlistId: string): PartyBuilder {
        this.spotifyPlaylistId = playlistId;
        return this;
    }

    public build(): PartyDB {
        let p = new PartyDB();
        p.name = this.name;
        p.code = this.code;
        p.id = this.id;
        p.startTime = (new Date()).valueOf();
        p.spotifyToken = this.spotifyToken;
        p.spotifyRefreshToken = this.spotifyRefreshToken;
        p.spotifyTokenExpire = moment().valueOf() + (1000 * this.spotifyTokenExpire);
        p.spotifyUserId = this.spotifyUserId;
        p.spotifyPlaylistId = this.spotifyPlaylistId;
        return p;
    }

}
