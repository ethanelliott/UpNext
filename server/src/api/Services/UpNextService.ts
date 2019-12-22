import { Service } from "typedi";
import logger from "../../util/Log";
import PartyDBService from "./PartyDBService";
import Party from "../Types/Party";
import SpotifyService from "./SpotifyService";
import { env } from "../../env";
import CurrentlyPlayingObject from "../Spotify/Types/CurrentlyPlayingObject";
import PartyPlayState from "../Types/PartyPlayState";
import PlaylistEntry from "../Types/PlaylistEntry";
import deep from 'deepcopy';
import { PartyStateEnum } from "../Types/PartyStateEnum";

@Service()
export default class UpNextService {

    private currentEventLoopParties = {};

    private static readonly CLOCK_CYCLE = 1000;

    constructor(
        private partyDBService: PartyDBService,
        private spotifyService: SpotifyService
    ) {
        logger.info(`[UPNEXT] Starting UpNext....`);
        this.startPartyEventLoop();
        logger.info(`[UPNEXT] UpNext Running`);
    }

    public startPartyEventLoop() {
        let allParties = this.partyDBService.getAllParties();
        allParties.forEach((globParty) => {
            if (this.currentEventLoopParties[globParty.id] === undefined) {
                logger.info(`[UPNEXT] Starting party ${globParty._id}`);
                let ref = this;
                ref.currentEventLoopParties[globParty.id] = setInterval(async () => {
                    let party = ref.partyDBService.findPartyById(globParty.id);
                    await ref.checkForValidToken(party);
                    let playState = await this.spotifyService.getSpotifyAPI().player.getPlayingContext(party.token);
                    switch (party.state) {
                        case PartyStateEnum.PLAYING:
                            if (playState && playState.item && playState.item.duration_ms - playState.progress_ms <= 2500) {
                                ref.setPartyState(party, PartyStateEnum.SKIPPING);
                            }
                            if (playState.item.id !== party.previousSong) {
                                ref.setPartyState(party, PartyStateEnum.NEW_SONG);
                            }
                            break;
                        case PartyStateEnum.SKIPPING:
                            await ref.nextSong(party);
                            ref.setPartyState(party, PartyStateEnum.NEW_SONG);
                            break;
                        case PartyStateEnum.NEW_SONG:
                            // do stuff that happens once when the new song starts
                            ref.updatePreviousSong(party, playState.item.id);
                            ref.setPartyState(party, PartyStateEnum.PLAYING);
                            break;
                    }
                    ref.updatePartyPlaystate(party, playState);
                }, UpNextService.CLOCK_CYCLE);
            }
        });
    }

    public updatePreviousSong(party: Party, id: string) {
        this.partyDBService.updatePreviousSong(party.id, id);
    }

    public setPartyState(party: Party, partyState: PartyStateEnum) {
        this.partyDBService.updatePartyState(party.id, partyState);
    }

    public addSongToHistory(party: Party, songId: string) {
        this.partyDBService.updatePartyHistory(party.id, songId);
    }

    public updatePartyPlaylist(party: Party, playlist: Array<PlaylistEntry>) {
        this.partyDBService.updatePartyPlaylist(party.id, playlist);
    }

    public async playSong(party: Party, songId: string) {
        await this.spotifyService.getSpotifyAPI().player.playSong(party.token, songId);
    }

    public async nextSong(party: Party) {
        if (party.playlist.length > 0) {
            let playlist: Array<PlaylistEntry> = deep(party.playlist);
            playlist.sort(playlistSort);
            let nextSong = playlist.shift();
            this.updatePartyPlaylist(party, playlist);
            this.addSongToHistory(party, nextSong.id);
            await this.playSong(party, nextSong.id);
        } else {
            // auto play a song
            await this.playSong(party, "7I3skNaQdvZSS7zXY2VHId");
        }
    }

    public updatePartyPlaystate(party: Party, currentlyPlaying: CurrentlyPlayingObject) {
        let ps = new PartyPlayState();
        ps.isPlaying = currentlyPlaying.is_playing;
        ps.trackId = currentlyPlaying.item.id;
        ps.trackName = currentlyPlaying.item.name;
        ps.artistName = currentlyPlaying.item.artists.map(e => e.name).join(', ');
        ps.albumName = currentlyPlaying.item.album.name;
        ps.albumArtwork = currentlyPlaying.item.album.images;
        ps.duration = currentlyPlaying.item.duration_ms;
        ps.progress = currentlyPlaying.progress_ms;
        this.partyDBService.updatePartyPlaystate(party.id, ps);
    }

    private async checkForValidToken(party: Party): Promise<void> {
        let now = (new Date()).valueOf();
        if (party.tokenExpire - now <= 60000 * 5) {
            let refreshTokenData = await this.spotifyService.getSpotifyAPI()
                .auth
                .refreshAuthToken(
                    env.app.spotify.clientId,
                    env.app.spotify.clientSecret,
                    party.refreshToken
                );
            this.partyDBService.refreshPartyToken(party.id, refreshTokenData.access_token, refreshTokenData.expires_in);
        }
    }
}

const playlistSort = ($a: PlaylistEntry, $b:PlaylistEntry) => {
    let n = $b.votes - $a.votes;
    if (n !== 0) return n;
    return $a.addedAt - $b.addedAt;
};
