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
import Vibrant = require('node-vibrant');
import { Vec3 } from "node-vibrant/lib/color";
import Colour from "../Types/Colours";

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
                    try {
                        let party = ref.partyDBService.findPartyById(globParty.id);
                        await ref.checkForValidToken(party);
                        let playState = await this.spotifyService.getSpotifyAPI().player.getPlayingContext(party.token);
                        switch (party.state) {
                            case PartyStateEnum.PLAYING:
                                if (playState && playState.item) {
                                    if (playState.item.duration_ms - playState.progress_ms <= 2500) {
                                        ref.setPartyState(party, PartyStateEnum.SKIPPING);
                                    }
                                    if (playState.item.id !== party.previousSong) {
                                        ref.setPartyState(party, PartyStateEnum.NEW_SONG);
                                    }
                                    ref.updatePartyPlaystate(party, playState);
                                } else {
                                    ref.setPartyState(party, PartyStateEnum.NOTHING_PLAYING);
                                }
                                break;
                            case PartyStateEnum.SKIPPING:
                                await ref.nextSong(party);
                                ref.setPartyState(party, PartyStateEnum.NEW_SONG);
                                break;
                            case PartyStateEnum.NEW_SONG:
                                if (party.previousSong !== playState.item.id) {
                                    await ref.addSongToPlaylist(party, playState.item.id);
                                }
                                ref.updatePreviousSong(party, playState.item.id);
                                ref.setPartyState(party, PartyStateEnum.PLAYING);
                                ref.updatePartyPlaystate(party, playState);
                                // update the colours
                                ref.updatePartyColours(ref.partyDBService.findPartyById(party.id));
                                break;
                            case PartyStateEnum.NOTHING_PLAYING:
                                // TODO: need to find a nice way to tell the user that nothing is playing
                                if (playState && playState.item) {
                                    ref.setPartyState(party, PartyStateEnum.PLAYING);
                                }
                                break;
                        }
                    } catch (e) {
                        logger.error(`Error in the main party thread with party: ${globParty.id}`);
                        console.log(e);
                    }
                }, UpNextService.CLOCK_CYCLE);
            }
        });
    }

    public updatePartyColours(party: Party) {
        let t = this;
        Vibrant.from(party.playState.albumArtwork.filter(e => e.width < 100)[0].url).getPalette().then((palette) => {
            this.partyDBService.updatePartyColours(party.id, {
                vibrant: t.vec3ToColour(palette.Vibrant.getRgb()),
                darkVibrant: t.vec3ToColour(palette.DarkVibrant.getRgb()),
                lightVibrant: t.vec3ToColour(palette.LightVibrant.getRgb()),
                muted: t.vec3ToColour(palette.Muted.getRgb()),
                darkMuted: t.vec3ToColour(palette.DarkMuted.getRgb()),
                lightMuted: t.vec3ToColour(palette.LightMuted.getRgb()),
            });
        });
    }

    private vec3ToColour(rgb: Vec3): Colour {
        return {
            r: Math.floor(rgb[0]),
            g: Math.floor(rgb[1]),
            b: Math.floor(rgb[2])
        };
    }

    public async fixChromecastBug(partyId: string) {
        let p = this.partyDBService.findPartyById(partyId);
        await this.playSong(p, p.playState.trackId);
    }

    public async addSongToPlaylist(party: Party, id: string) {
        await this.spotifyService.getSpotifyAPI().playlist.addTracks(party.token, party.playlistId, [id]);
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
        // playing a song should also possibly return a state to represent the error
        try {
            // the idea here is that with 2 calls to play, the chrome bug might not happen
            await this.spotifyService.getSpotifyAPI().player.playSong(party.token, songId);
            await this.spotifyService.getSpotifyAPI().player.playSong(party.token, songId);
        } catch (e) {
            if (e.name === 404) {
                return {
                    error: true,
                    message: 'No Active Devices.'
                };
            } else if (e.name === 403) {
                return {
                    error: true,
                    message: 'Not a Premium Member.'
                };
            }
        }
        return {
            error: false,
            message: null
        };
    }

    public async nextSong(party: Party) {
        this.addSongToHistory(party, party.previousSong);
        if (party.playlist.length > 0) {
            let playlist: Array<PlaylistEntry> = deep(party.playlist);
            playlist.sort(playlistSort);
            let nextSong = playlist.shift();
            this.updatePartyPlaylist(party, playlist);
            await this.playSong(party, nextSong.id);
        } else {
            // auto play a song -> use spotify to guess based on history
            // await this.playSong(party, "7I3skNaQdvZSS7zXY2VHId");
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
        ps.device = currentlyPlaying.device;
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

    public stopPartyByUserId(userId: string) {
        let p = this.partyDBService.findPartyByUserId(userId);
        if (p) {
            clearInterval(this.currentEventLoopParties[p.id]);
            delete this.currentEventLoopParties[p.id];
        }
    }

    public stopPartyByPartyId(partyId: string) {
        let p = this.partyDBService.findPartyById(partyId);
        if (p) {
            clearInterval(this.currentEventLoopParties[p.id]);
            delete this.currentEventLoopParties[p.id];
        }
    }

    public async togglePlayback(partyId: string) {
        let p = this.partyDBService.findPartyById(partyId);
        if (p) {
            if (p.playState.isPlaying) {
                await this.spotifyService.getSpotifyAPI().player.pause(p.token);
            } else {
                await this.spotifyService.getSpotifyAPI().player.play(p.token);
            }
        }
    }
}

export const playlistSort = ($a: PlaylistEntry, $b: PlaylistEntry) => {
    let n = $b.votes - $a.votes;
    if (n !== 0) return n;
    return $a.addedAt - $b.addedAt;
};
