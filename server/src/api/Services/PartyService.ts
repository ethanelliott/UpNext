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

@Service()
export class PartyService {

    constructor(
        private uuidService: UUIDService,
        private newPartyService: NewPartyService,
        private spotifyService: SpotifyService,
        private spotifyStateService: SpotifyStateService,
        private userDatabaseService: UserDatabaseService,
        private partyDatabaseService: PartyDatabaseService,
        private partyHistoryDatabaseService: PartyHistoryDatabaseService,
        private playlistEntryDatabaseService: PlaylistEntryDatabaseService,
        private upNextService: UpNextService,
    ) {

    }

    public async newParty(state: SpotifyOAuthState, code: string): Promise<any> {
        this.removeNewPartyEntry(state.partyId);
        const callbackData = await this.spotifyService.getSpotifyAPI().auth.authorizationCode(env.app.spotify.clientId, env.app.spotify.clientSecret, code, env.app.spotify.redirectURI);
        const userData = await this.spotifyService.getSpotifyAPI().users.getCurrent(callbackData.access_token);
        if (userData.product !== 'premium') {
            // must be premium to play songs
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
        // remove parties that the user already has running
        // this needs to be watched for FK constraint violation
        this.removePartyBySpotifyUserId(userData.id);
        // create all the new party data
        this.partyDatabaseService.insertParty(party);
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
            .build();
        this.userDatabaseService.insertUser(user);
        return user.id;
    }

    public removeUser(partyId: string, userId: string) {
        const users = this.userDatabaseService.getUsersAtParty(partyId);
        if (users.length > 0) {
            this.userDatabaseService.removeUserByUserId(userId);
            if (users.length === 1 && users[0].id === userId) {
                this.removePartyByPartyId(partyId);
            }
        }
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
        return this.playlistEntryDatabaseService.getAllPlaylistEntriesForParty(partyId);
    }

    // all of this is wrong
    public upvoteSong(partyId: string, userId: string, playlistEntryId: string): void {
        // this.upNextService.emitEventToProcess(partyId, ProcessorEvents.PLAYLIST_UPVOTE_SONG, {userId, playlistEntryId});
    }

    public downvoteSong(partyId: string, userId: string, playlistEntryId: string): void {
        // this.upNextService.emitEventToProcess(partyId, ProcessorEvents.PLAYLIST_DOWNVOTE_SONG, {userId, playlistEntryId});
    }

    public addSongToPlaylist(partyId: string, userId: string, songId: string) {
        // this.upNextService.emitEventToProcess(partyId, ProcessorEvents.PLAYLIST_ADD_SONG, {userId, songId});
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
}