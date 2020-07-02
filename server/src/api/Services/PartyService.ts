import { Service } from "typedi";
import { UUIDService } from "./UUIDService";
import { NewPartyService } from "./NewPartyService";
import { SpotifyService } from "./SpotifyService";
import { env } from "../../env";
import { SpotifyOAuthState } from "../Types/general/SpotifyOAuthState";
import { PartyDB } from "../Types/DatabaseMaps/PartyDB";
import { PartyBuilder } from "../Factory/PartyBuilder";
import { PartyDatabaseService } from "./Database/PartyDatabaseService";
import { UserDatabaseService } from "./Database/UserDatabaseService";
import { UserDB } from "../Types/DatabaseMaps/UserDB";
import { UserBuilder } from "../Factory/UserBuilder";
import { PartyJoinToken } from "../Types/general/PartyJoinToken";
import { UserPermissionEnum } from "../Types/Enums/UserPermissionEnum";
import { PlaylistEntryDatabaseService } from "./Database/PlaylistEntryDatabaseService";
import { PlaylistEntryDB } from "../Types/DatabaseMaps/PlaylistEntryDB";
import { UpNextService } from "./UpNextService";
import { SpotifyStateService } from "./SpotifyStateService";
import { PlaylistVoteDatabaseService } from "./Database/PlaylistVoteDatabaseService";
import { PlaylistVoteEnum } from "../Types/Enums/PlaylistVoteEnum";
import moment from "moment";
import { PartyEvent } from "../Factory/PartyEventEmitterBuilder";
import { EventEmitterService } from "./EventEmitterService";
import { CronJobService } from "./CronJobService";
import { userSort } from "./sorts";

@Service()
export class PartyService {

    constructor(
        private uuidService: UUIDService,
        private newPartyService: NewPartyService,
        private spotifyService: SpotifyService,
        private eventEmitterService: EventEmitterService,
        private spotifyStateService: SpotifyStateService,
        private userDatabaseService: UserDatabaseService,
        private partyDatabaseService: PartyDatabaseService,
        private playlistEntryDatabaseService: PlaylistEntryDatabaseService,
        private playlistVoteDatabaseService: PlaylistVoteDatabaseService,
        private upNextService: UpNextService,
        private cronJobService: CronJobService
    ) {
        this.cronJobService.newCronJob({
            pattern: '*/10 * * * *',
            method: async () => {
                const t24Hr = moment().subtract(24, 'hours').valueOf();
                const parties = await this.getAllParties();
                parties
                    .filter(e => e.startTime < t24Hr)
                    .forEach(e => this.removePartyByPartyId(e.id));
            }
        });
    }

    public async newParty(state: SpotifyOAuthState, code: string): Promise<any> {
        await this.removeNewPartyEntry(state.partyId);
        const callbackData = await this.spotifyService.getSpotifyAPI().auth.authorizationCode(env.app.spotify.clientId, env.app.spotify.clientSecret, code, env.app.spotify.redirectURI);
        const userData = await this.spotifyService.getSpotifyAPI().users.getCurrent(callbackData.access_token);
        if (userData.product !== 'premium') {
            return {token: null, error: 'Must have premium spotify!'};
        }
        const playlistData = await this.spotifyService.getSpotifyAPI().playlist.create(callbackData.access_token, userData.id, {
            name: `${state.partyName} 🎵`,
            description: `${state.partyName} archive, brought to you by UpNext.cool`,
            public: true,
            collaborative: false
        });
        const party: PartyDB = PartyBuilder.make()
            .withName(state.partyName)
            .withCode()
            .withId(state.partyId)
            .withToken(callbackData.access_token)
            .withRefreshToken(callbackData.refresh_token)
            .withTokenExpire(callbackData.expires_in)
            .withUserId(userData.id)
            .withPlaylistId(playlistData.id)
            .build();
        await this.removePartyBySpotifyUserId(userData.id);
        await this.partyDatabaseService.insertParty(party);
        await this.spotifyStateService.startSpotifyEventLoops();
        await this.upNextService.startParties();
    }

    public async removePartyBySpotifyUserId(userId: string): Promise<void> {
        const p = await this.partyDatabaseService.getPartyBySpotifyUserId(userId);
        if (p) {
            const partyId = p.id;
            await this.removePartyByPartyId(partyId);
        }
    }

    public async removePartyByPartyId(partyId: string): Promise<void> {
        this.upNextService.stopPartyByPartyId(partyId);
        this.spotifyStateService.stopSpotifyStateForParty(partyId);
        await this.partyDatabaseService.removePartyByPartyId(partyId);
        this.eventEmitterService.emitEventToParty(partyId, PartyEvent.PARTY_GONE);
    }

    public async removeNewPartyEntry(partyId: string): Promise<void> {
        await this.newPartyService.remove(partyId);
    }

    public async joinParty(token: PartyJoinToken): Promise<string> {
        const user: UserDB = UserBuilder
            .make()
            .withId(this.uuidService.new())
            .withName(token.name)
            .withPermission(token.admin ? UserPermissionEnum.ADMIN : UserPermissionEnum.DEFAULT)
            .withPartyId(token.partyId)
            .withScore(0)
            .withTrackingId(token.trackingId)
            .build();
        await this.userDatabaseService.insertUser(user);
        await this.emitUsersUpdate(token.partyId);
        return user.id;
    }

    // private emitNotificationToParty(partyId: string, title: string, body: string, actions: Array<{ action: string, title: string }>) {
    //     this.eventEmitterService.emitEventToParty(
    //         partyId,
    //         PartyEvent.NOTIFICATION,
    //         {
    //             title,
    //             body,
    //             actions
    //         }
    //     );
    // }

    public async getPartyIdFromCode(code: string): Promise<string | undefined> {
        const party = await this.partyDatabaseService.getPartyIdByCode(code);
        if (party) {
            return party.id;
        }
        return undefined;
    }

    public async getPartyFromId(partyId: string): Promise<PartyDB> {
        return await this.partyDatabaseService.getPartyById(partyId);
    }

    public async getPlaylistForPartyId(partyId: string): Promise<Array<PlaylistEntryDB>> {
        const playlistEntries = await this.playlistEntryDatabaseService.getAllPlaylistEntriesForParty(partyId);
        return Promise.all(playlistEntries.map(async e => {
            const user = await this.getUserById(e.addedBy);
            e.addedBy = user.nickname;
            return e;
        }));
    }

    public async cleanPlaylistForPartyId(partyId: string): Promise<void> {
        const entries = await this.playlistEntryDatabaseService.getAllPlaylistEntriesForParty(partyId);
        entries.forEach(e => {
            if (e.UpVotes - e.DownVotes < 0) {
                this.playlistEntryDatabaseService.removePlaylistEntryById(e.id);
            }
        });
    }

    public async upvoteSong(partyId: string, userId: string, playlistEntryId: string): Promise<void> {
        const entry = await this.playlistEntryDatabaseService.getPlaylistEntryById(playlistEntryId);
        const userVotes = await this.playlistVoteDatabaseService.getVotesForUserOnEntry(userId, playlistEntryId);
        if (userVotes.length === 0) {
            // perfect the user has yet to upvote
            await this.playlistVoteDatabaseService.insertVote({
                userId: userId,
                playlistEntryId: playlistEntryId,
                type: PlaylistVoteEnum.UPVOTE
            });
            await this.playlistEntryDatabaseService.addUpVote(playlistEntryId);
            await this.userDatabaseService.updateUserScore(entry.addedBy, 1);
            await this.emitPlaylistUpdate(partyId);
            await this.emitUsersUpdate(partyId);
        } else if (userVotes.length === 1) {
            if (userVotes[0].type === PlaylistVoteEnum.DOWNVOTE) {
                await this.playlistEntryDatabaseService.removeDownVote(playlistEntryId);
                await this.playlistEntryDatabaseService.addUpVote(playlistEntryId);
                await this.playlistVoteDatabaseService.deleteVote(playlistEntryId, userId);
                await this.playlistVoteDatabaseService.insertVote({
                    type: PlaylistVoteEnum.UPVOTE,
                    playlistEntryId,
                    userId
                });
                await this.userDatabaseService.updateUserScore(entry.addedBy, 1);
                await this.emitPlaylistUpdate(partyId);
                await this.emitUsersUpdate(partyId);
            } else if (userVotes[0].type === PlaylistVoteEnum.UPVOTE) {
                await this.playlistEntryDatabaseService.removeUpVote(playlistEntryId);
                await this.playlistVoteDatabaseService.deleteVote(playlistEntryId, userId);
                await this.userDatabaseService.updateUserScore(entry.addedBy, -1);
                await this.emitPlaylistUpdate(partyId);
                await this.emitUsersUpdate(partyId);
            }
        }
    }

    public async downvoteSong(partyId: string, userId: string, playlistEntryId: string): Promise<void> {
        const entry = await this.playlistEntryDatabaseService.getPlaylistEntryById(playlistEntryId);
        const userVotes = await this.playlistVoteDatabaseService.getVotesForUserOnEntry(userId, playlistEntryId);
        if (userVotes.length === 0) {
            // perfect the user has yet to upvote
            await this.playlistVoteDatabaseService.insertVote({
                userId: userId,
                playlistEntryId: playlistEntryId,
                type: PlaylistVoteEnum.DOWNVOTE
            });
            await this.playlistEntryDatabaseService.addDownVote(playlistEntryId);
            await this.userDatabaseService.updateUserScore(entry.addedBy, -1);
            await this.emitPlaylistUpdate(partyId);
            await this.emitUsersUpdate(partyId);
        } else if (userVotes.length === 1) {
            if (userVotes[0].type === PlaylistVoteEnum.UPVOTE) {
                await this.playlistEntryDatabaseService.removeUpVote(playlistEntryId);
                await this.playlistEntryDatabaseService.addDownVote(playlistEntryId);
                await this.playlistVoteDatabaseService.deleteVote(playlistEntryId, userId);
                await this.playlistVoteDatabaseService.insertVote({
                    type: PlaylistVoteEnum.DOWNVOTE,
                    playlistEntryId,
                    userId
                });
                await this.userDatabaseService.updateUserScore(entry.addedBy, -1);
                await this.emitPlaylistUpdate(partyId);
                await this.emitUsersUpdate(partyId);
            } else if (userVotes[0].type === PlaylistVoteEnum.DOWNVOTE) {
                await this.playlistEntryDatabaseService.removeDownVote(playlistEntryId);
                await this.playlistVoteDatabaseService.deleteVote(playlistEntryId, userId);
                await this.userDatabaseService.updateUserScore(entry.addedBy, 1);
                await this.emitPlaylistUpdate(partyId);
                await this.emitUsersUpdate(partyId);
            }
        }
    }

    public async addSongToPlaylist(partyId: string, userId: string, songId: string): Promise<boolean> {
        if (!await this.playlistEntryDatabaseService.doesEntryExist(partyId, songId)) {
            const party = await this.partyDatabaseService.getPartyById(partyId);
            const song = await this.spotifyService.getSpotifyAPI().tracks.getTrack(party.spotifyToken, songId);
            const entryId = this.uuidService.new();
            await this.playlistEntryDatabaseService.insertPlaylistEntry({
                id: entryId,
                name: song.name,
                spotifySongId: songId,
                DownVotes: 0,
                UpVotes: 1,
                albumArtwork: song.album.images.filter(e => e.width === Math.min(...song.album.images.map(u => u.width)))[0].url,
                artist: song.artists.map(e => e.name).join(', '),
                addedBy: userId,
                addedAt: moment().valueOf(),
                partyId: partyId
            });
            await this.playlistVoteDatabaseService.insertVote({
                type: PlaylistVoteEnum.UPVOTE,
                playlistEntryId: entryId,
                userId
            });
            await this.userDatabaseService.updateUserScore(userId, 1);
            await this.emitPlaylistUpdate(partyId);
            await this.emitUsersUpdate(partyId);
            return true;
        } else {
            //its already in the playlist
            return false;
        }
    }

    public async emitPlaylistUpdate(partyId) {
        const playlist = await this.getPlaylistForPartyId(partyId);
        this.eventEmitterService.emitEventToParty(
            partyId,
            PartyEvent.PLAYLIST_UPDATE,
            {
                playlist
            }
        );
    }

    public async emitUsersUpdate(partyId) {
        const users = await this.userDatabaseService.getUsersAtParty(partyId);
        this.eventEmitterService.emitEventToParty(
            partyId,
            PartyEvent.USERS_UPDATE,
            {
                users: users.sort(userSort)
            }
        );
    }

    public async removeSongFromPlaylist(partyId: string, userId: string, songId: string) {
        if (await this.playlistEntryDatabaseService.doesEntryExist(partyId, songId)) {
            await this.playlistEntryDatabaseService.removePlaylistEntry(partyId, userId, songId);
            await this.emitPlaylistUpdate(partyId);
        }
    }

    public async search(partyId: string, searchTerm: string): Promise<any> {
        const party = await this.partyDatabaseService.getPartyById(partyId);
        const token = party.spotifyToken;
        return await this.spotifyService.getSpotifyAPI().search.searchEverything(token, searchTerm, 20);
    }

    // this seems like a code smell
    public async getUserById(userId: string): Promise<UserDB> {
        return await this.userDatabaseService.getUserById(userId);
    }

    public async getAllParties(): Promise<Array<PartyDB>> {
        return await this.partyDatabaseService.getAllParties();
    }

    public async getPartyById(partyId: string): Promise<PartyDB> {
        return await this.partyDatabaseService.getPartyById(partyId);
    }

    public async getUserByTrackingId(trackingId: string): Promise<Array<UserDB>> {
        return await this.userDatabaseService.getUserByTrackingId(trackingId);
    }

    public async removeUserByTrackingId(trackingId: string) {
        const userArray = await this.userDatabaseService.getUserByTrackingId(trackingId);
        if (userArray.length === 1) {
            const user = userArray[0];
            const votes = await this.playlistVoteDatabaseService.getVotesForUser(user.id);
            for (const e of votes) {
                switch (e.type) {
                    case PlaylistVoteEnum.UPVOTE:
                        await this.playlistEntryDatabaseService.removeUpVote(e.playlistEntryId);
                        break;
                    case PlaylistVoteEnum.DOWNVOTE:
                        await this.playlistEntryDatabaseService.removeDownVote(e.playlistEntryId);
                        break;
                }
            }
            await this.playlistVoteDatabaseService.deleteVotesForUser(user.id);
            await this.playlistEntryDatabaseService.removePlaylistEntryByUserId(user.id);
            await this.emitPlaylistUpdate(user.partyId);
            await this.userDatabaseService.removeUserByTrackingId(trackingId);
        }
    }

    public async togglePlayback(partyId: string) {
        const party = await this.partyDatabaseService.getPartyById(partyId);
        const partyState = this.upNextService.getPartyDataForPartyId(partyId);
        if (partyState.isPlaying) {
            await this.spotifyService.getSpotifyAPI().player.pause(party.spotifyToken);
        } else {
            await this.spotifyService.getSpotifyAPI().player.play(party.spotifyToken);
        }
    }

    public async nextSong(partyId: string) {
        const party = await this.partyDatabaseService.getPartyById(partyId);
        const playlist = await this.playlistEntryDatabaseService.getAllPlaylistEntriesForParty(partyId);
        if (playlist.length > 0) {
            await this.upNextService.queueNextSong(playlist, party);
            await this.spotifyService.getSpotifyAPI().player.nextSong(party.spotifyToken);
        } else {
            await this.spotifyService.getSpotifyAPI().player.nextSong(party.spotifyToken);
        }
    }

    public async fixChromecastError(partyId: string) {
        const party = await this.partyDatabaseService.getPartyById(partyId);
        const partyState = this.upNextService.getPartyDataForPartyId(partyId);
        await this.spotifyService.getSpotifyAPI().player.addSongToEndOfQueue(party.spotifyToken, partyState.trackId);
        await this.spotifyService.getSpotifyAPI().player.nextSong(party.spotifyToken);
    }
}
