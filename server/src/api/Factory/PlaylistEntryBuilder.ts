import PlaylistEntry from "../Types/PlaylistEntry";
import UserBuilder from "./UserBuilder";
import User from "../Types/User";

export default class PlaylistEntryBuilder {
    private userId: string;
    private userName: string;
    private songId: string;
    private songName: string;
    private albumArtwork: string;
    private artistName: string;

    constructor() {
    }

    public static make(): PlaylistEntryBuilder {
        return new PlaylistEntryBuilder();
    }

    public withUserId(userId: string): PlaylistEntryBuilder {
        this.userId = userId;
        return this;
    }

    public withUserName(userName: string): PlaylistEntryBuilder {
        this.userName = userName;
        return this;
    }

    public withSongId(songId: string): PlaylistEntryBuilder {
        this.songId = songId;
        return this;
    }

    public withSongName(songName: string): PlaylistEntryBuilder {
        this.songName = songName;
        return this;
    }

    public withAlbumArtwork(albumArtwork: string): PlaylistEntryBuilder {
        this.albumArtwork = albumArtwork;
        return this;
    }

    public withArtistName(artistName: string): PlaylistEntryBuilder {
        this.artistName = artistName;
        return this;
    }

    public build(): PlaylistEntry {
        let u = UserBuilder.make().withName(this.userName).withId(this.userId).build();
        let p = new PlaylistEntry();
        p.votes = 1; // starts at one
        p.addedAt = (new Date()).valueOf();
        p.id = this.songId;
        p.added = u;
        p.albumArtwork = this.albumArtwork;
        p.artist = this.artistName;
        p.downVoters = new Array<User>();
        p.upVoters = new Array<User>();
        p.upVoters.push(u); // auto-vote on your own song
        p.name = this.songName;
        return p;
    }

}
