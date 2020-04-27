import { Service } from "typedi";
import { UUIDService } from "./UUIDService";
import { NewPartyService } from "./NewPartyService";
import { SpotifyService } from "./SpotifyService";
import { env } from "../../env";
import { SpotifyOAuthState } from "../Types/general/SpotifyOAuthState";
import { PartyDB } from "../Types/DatabaseMaps/PartyDB";
import { PartyBuilder } from "../Factory/PartyBuilder";
import { PartyDatabaseService } from "./Database/PartyDatabaseService";
import { PartyHistoryDatabaseService } from "./Database/PartyHistoryDatabaseService";
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
        private partyHistoryDatabaseService: PartyHistoryDatabaseService,
        private playlistEntryDatabaseService: PlaylistEntryDatabaseService,
        private playlistVoteDatabaseService: PlaylistVoteDatabaseService,
        private upNextService: UpNextService,
    ) {
    }

    public async newParty(state: SpotifyOAuthState, code: string): Promise<any> {
        this.removeNewPartyEntry(state.partyId);
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
        this.removePartyBySpotifyUserId(userData.id);
        this.partyDatabaseService.insertParty(party);
        this.spotifyStateService.startSpotifyEventLoops();
        await this.upNextService.startParties();
    }

    public removePartyBySpotifyUserId(userId: string): void {
        const p = this.partyDatabaseService.getPartyBySpotifyUserId(userId);
        if (p) {
            const partyId = p.id;
            this.removePartyByPartyId(partyId);
        }
    }

    public removePartyByPartyId(partyId: string): void {
        this.upNextService.stopPartyByPartyId(partyId);
        this.spotifyStateService.stopSpotifyStateForParty(partyId);
        this.partyHistoryDatabaseService.removeHistoryForParty(partyId);
        this.playlistEntryDatabaseService.removePlaylistEntriesByPartyId(partyId);
        this.userDatabaseService.removeAllUsersWithPartyId(partyId);
        this.partyDatabaseService.removePartyByPartyId(partyId);
    }

    public removeNewPartyEntry(partyId: string): void {
        this.newPartyService.remove(partyId);
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
        this.userDatabaseService.insertUser(user);
        return user.id;
    }

    public getPartyIdFromCode(code: string): string | undefined {
        const party = this.partyDatabaseService.getPartyIdByCode(code);
        if (party) {
            return party.id;
        }
        return undefined;
    }

    public getPartyFromId(partyId: string): PartyDB {
        return this.partyDatabaseService.getPartyById(partyId);
    }

    public getPlaylistForPartyId(partyId: string): Array<PlaylistEntryDB> {
        return this.playlistEntryDatabaseService.getAllPlaylistEntriesForParty(partyId).map(e => {
            e.addedBy = this.getUserById(e.addedBy).nickname;
            return e;
        });
    }

    public upvoteSong(partyId: string, userId: string, playlistEntryId: string): void {
        const userVotes = this.playlistVoteDatabaseService.getVotesForUserOnEntry(userId, playlistEntryId);
        if (userVotes.length === 0) {
            // perfect the user has yet to upvote
            this.playlistVoteDatabaseService.insertVote({
                userId: userId,
                playlistEntryId: playlistEntryId,
                type: PlaylistVoteEnum.UPVOTE
            });
            this.playlistEntryDatabaseService.addUpVote(playlistEntryId);
            this.emitPlaylistUpdate(partyId);
        } else if (userVotes.length === 1) {
            // user has made a vote, if its a downvote, get rid of it
            if (userVotes[0].type === PlaylistVoteEnum.DOWNVOTE) {
                this.playlistEntryDatabaseService.removeDownVote(playlistEntryId);
                this.playlistEntryDatabaseService.addUpVote(playlistEntryId);
                this.playlistVoteDatabaseService.updateVote(playlistEntryId, userId, PlaylistVoteEnum.UPVOTE);
                this.emitPlaylistUpdate(partyId);
            }
        }
    }

    public downvoteSong(partyId: string, userId: string, playlistEntryId: string): void {
        const userVotes = this.playlistVoteDatabaseService.getVotesForUserOnEntry(userId, playlistEntryId);
        if (userVotes.length === 0) {
            // perfect the user has yet to upvote
            this.playlistVoteDatabaseService.insertVote({
                userId: userId,
                playlistEntryId: playlistEntryId,
                type: PlaylistVoteEnum.DOWNVOTE
            });
            this.playlistEntryDatabaseService.addUpVote(playlistEntryId);
            this.emitPlaylistUpdate(partyId);
        } else if (userVotes.length === 1) {
            // user has made a vote, if its a downvote, get rid of it
            if (userVotes[0].type === PlaylistVoteEnum.UPVOTE) {
                this.playlistEntryDatabaseService.removeUpVote(playlistEntryId);
                this.playlistEntryDatabaseService.addDownVote(playlistEntryId);
                this.playlistVoteDatabaseService.updateVote(playlistEntryId, userId, PlaylistVoteEnum.DOWNVOTE);
                this.emitPlaylistUpdate(partyId);
            }
        }
    }

    public async addSongToPlaylist(partyId: string, userId: string, songId: string) {
        if (!this.playlistEntryDatabaseService.doesEntryExist(partyId, songId)) {
            const party = this.partyDatabaseService.getPartyById(partyId);
            const song = await this.spotifyService.getSpotifyAPI().tracks.getTrack(party.spotifyToken, songId);
            const entryId = this.uuidService.new();
            this.playlistEntryDatabaseService.insertPlaylistEntry({
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
            this.playlistVoteDatabaseService.insertVote({
                type: PlaylistVoteEnum.UPVOTE,
                playlistEntryId: entryId,
                userId
            });
            this.emitPlaylistUpdate(partyId);
        } else {
            //its already in the playlist
        }
    }

    private emitPlaylistUpdate(partyId) {
        this.eventEmitterService.emitEventAt(
            partyId,
            PartyEvent.PLAYLIST_UPDATE,
            {
                party: this.partyDatabaseService.getPartyById(partyId),
                playlist: this.getPlaylistForPartyId(partyId)
            }
        );
    }

    public removeSongFromPlaylist(partyId: string, userId: string, songId: string) {
        // this.upNextService.emitEventToProcess(partyId, ProcessorEvents.PLAYLIST_REMOVE_SONG, {userId, songId});
    }

    public async search(partyId: string, searchTerm: string): Promise<any> {
        const token = this.partyDatabaseService.getPartyById(partyId).spotifyToken;
        return await this.spotifyService.getSpotifyAPI().search.searchEverything(token, searchTerm, 20);
    }

    // this seems like a code smell
    public getUserById(userId: string): UserDB {
        return this.userDatabaseService.getUserById(userId);
    }

    public getAllParties(): Array<PartyDB> {
        return this.partyDatabaseService.getAllParties();
    }

    public getPartyById(partyId: string): PartyDB {
        return this.partyDatabaseService.getPartyById(partyId);
    }

    public getUserByTrackingId(trackingId: string): Array<UserDB> {
        return this.userDatabaseService.getUserByTrackingId(trackingId);
    }

    public removeUserByTrackingId(trackingId: string) {
        const user = this.userDatabaseService.getUserByTrackingId(trackingId)[0];
        this.playlistVoteDatabaseService.getVotesForUser(user.id).forEach(e => {
            switch (e.type) {
                case PlaylistVoteEnum.UPVOTE:
                    this.playlistEntryDatabaseService.removeUpVote(e.playlistEntryId);
                    break;
                case PlaylistVoteEnum.DOWNVOTE:
                    this.playlistEntryDatabaseService.removeDownVote(e.playlistEntryId);
                    break;
            }
        });
        this.playlistVoteDatabaseService.deleteVotesForUser(user.id);
        this.playlistEntryDatabaseService.removePlaylistEntryByUserId(user.id);
        this.emitPlaylistUpdate(user.partyId);
        this.userDatabaseService.removeUserByTrackingId(trackingId);
    }
}