import 'reflect-metadata';
import { EmitOnFail, EmitOnSuccess, MessageBody, OnMessage, SocketController } from "socket-controllers";
import SocketMessage from "../Types/SocketMessage";
import PartyDBService from "../Services/PartyDBService";
import AuthenticationService from "../Services/AuthenticationService";
import UpNextService, { playlistSort } from "../Services/UpNextService";
import PlaylistEntryBuilder from "../Factory/PlaylistEntryBuilder";
import SpotifyService from "../Services/SpotifyService";


@SocketController()
export class PlaylistController {
    constructor(
        private authenticationService: AuthenticationService,
        private partyDBService: PartyDBService,
        private spotifyService: SpotifyService,
        private upNextService: UpNextService
    ) {
    }

    @OnMessage("get-state-playlist")
    @EmitOnSuccess("got-state-playlist")
    @EmitOnFail("party-leave")
    public async getPlaylistState(@MessageBody() message: SocketMessage<any>): Promise<SocketMessage<any>> {
        let a = this.authenticationService.authenticate(message.token);
        if (a.valid) {
            let party = this.partyDBService.findPartyById(a.data.partyId);
            return {
                token: message.token,
                data: {
                    playlistId: party.playlistId,
                    playlist: party.playlist.sort(playlistSort)
                }
            };
        } else {
            throw new Error('Invalid token! Please Leave!');
        }
    }

    @OnMessage("upvote-song")
    @EmitOnSuccess("song-upvoted")
    @EmitOnFail("party-leave")
    public async upvoteSong(@MessageBody() message: SocketMessage<any>): Promise<SocketMessage<any>> {
        let a = this.authenticationService.authenticate(message.token);
        if (a.valid) {
            let user = this.partyDBService.findUserById(a.data.partyId, a.data.userId);
            this.partyDBService.upvoteSong(a.data.partyId, message.data.songId, user);
            return {
                token: message.token,
                data: {}
            };
        } else {
            throw new Error('Invalid token! Please Leave!');
        }
    }

    @OnMessage("downvote-song")
    @EmitOnSuccess("song-downvoted")
    @EmitOnFail("party-leave")
    public async downvoteSong(@MessageBody() message: SocketMessage<any>): Promise<SocketMessage<any>> {
        let a = this.authenticationService.authenticate(message.token);
        if (a.valid) {
            let user = this.partyDBService.findUserById(a.data.partyId, a.data.userId);
            this.partyDBService.downvoteSong(a.data.partyId, message.data.songId, user);
            return {
                token: message.token,
                data: {}
            };
        } else {
            throw new Error('Invalid token! Please Leave!');
        }
    }

    @OnMessage("playlist-add-song")
    @EmitOnSuccess("playlist-song-added")
    @EmitOnFail('party-leave')
    public async addSongToPlaylist(@MessageBody() message: SocketMessage<any>): Promise<SocketMessage<any>> {
        let a = this.authenticationService.authenticate(message.token);
        if (a.valid) {
            let party = this.partyDBService.findPartyById(a.data.partyId);
            let track = await this.spotifyService.getSpotifyAPI().tracks.getTrack(party.token, message.data.songId);
            let user = this.partyDBService.findUserById(a.data.partyId, a.data.userId);
            let entry = PlaylistEntryBuilder.make()
                .withSongId(track.id)
                .withSongName(track.name)
                .withUserId(user.id)
                .withUserName(user.name)
                .withAlbumArtwork(track.album.images.filter(e => e.width < 100)[0].url)
                .withArtistName(track.artists.map(e => e.name).join(', '))
                .build();
            if (party.playlist.length === 0 && !party.playState.isPlaying) {
                let res = await this.upNextService.playSong(party, entry.id);
                if (res.error) {
                    // If there is nothing to play on, then just add it to the queue
                    this.partyDBService.addPlaylistEntry(party.id, entry);
                }
            } else {
                this.partyDBService.addPlaylistEntry(party.id, entry);
            }
            return {
                token: message.token,
                data: {}
            };
        } else {
            throw new Error('Invalid token! Please Leave!');
        }
    }
}
