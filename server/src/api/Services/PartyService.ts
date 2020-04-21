import { Service } from "typedi";
import { UUIDService } from "./UUIDService";
import { NewPartyService } from "./NewPartyService";
import { SpotifyService } from "./SpotifyService";
import { env } from "../../env";
import { SpotifyOAuthState } from "../Types/general/SpotifyOAuthState";
import { PartyDB } from "../Types/DatabaseMaps/PartyDB";
import { PartyBuilder } from "../Factory/PartyBuilder";
import { UpNextService } from "./UpNextService";
import { PartyDatabaseService } from "./Database/PartyDatabaseService";
import { PartyStateDB } from "../Types/DatabaseMaps/PartyStateDB";
import { PartyStateBuilder } from "../Factory/PartyStateBuilder";
import { PartyStateDatabaseService } from "./Database/PartyStateDatabaseService";
import { PartyHistoryDatabaseService } from "./Database/PartyHistoryDatabaseService";
import { UserDatabaseService } from "./Database/UserDatabaseService";
import { UserDB } from "../Types/DatabaseMaps/UserDB";
import { UserBuilder } from "../Factory/UserBuilder";
import { PartyJoinToken } from "../Types/general/PartyJoinToken";
import { UserPermissionEnum } from "../Types/Enums/UserPermissionEnum";
import { PlaylistEntryDatabaseService } from "./Database/PlaylistEntryDatabaseService";
import { PlaylistVoteDatabaseService } from "./Database/PlaylistVoteDatabaseService";
import { PlaylistEntryDB } from "../Types/DatabaseMaps/PlaylistEntryDB";
import { ProcessorEvents } from "./EventProcessorService";

@Service()
export class PartyService {

    constructor(
        private uuidService: UUIDService,
        private newPartyService: NewPartyService,
        private spotifyService: SpotifyService,
        private upNextService: UpNextService,
        private userDatabaseService: UserDatabaseService,
        private partyDatabaseService: PartyDatabaseService,
        private partyStateDatabaseService: PartyStateDatabaseService,
        private partyHistoryDatabaseService: PartyHistoryDatabaseService,
        private playlistEntryDatabaseService: PlaylistEntryDatabaseService,
        private playlistVoteDatabaseService: PlaylistVoteDatabaseService,
    ) {

    }

    public removeNewPartyEntry(partyId: string): void {
        this.newPartyService.remove(partyId);
    }

    public async newParty(state: SpotifyOAuthState, code: string): Promise<any> {
        this.removeNewPartyEntry(state.partyId);
        const callbackData = await this.spotifyService.getSpotifyAPI().auth.authorizationCode(env.app.spotify.clientId, env.app.spotify.clientSecret, code, env.app.spotify.redirectURI);
        const userData = await this.spotifyService.getSpotifyAPI().users.getCurrent(callbackData.access_token);
        if (userData.product !== 'premium') {
            // must be premium to play songs
            return {token: 'error'};
        }
        const playlistData = await this.spotifyService.getSpotifyAPI().playlist.create(callbackData.access_token, userData.id, {
            name: `${state.partyName}🎵`,
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
        const partyState: PartyStateDB = PartyStateBuilder
            .make()
            .withId(this.uuidService.new())
            .withPartyId(state.partyId)
            .build();
        // remove parties that the user already has running
        this.upNextService.stopPartyBySpotifyUserId(userData.id);
        this.partyDatabaseService.removePartyBySpotifyUserId(userData.id);
        // create all the new party data
        this.partyDatabaseService.insertParty(party);
        this.partyStateDatabaseService.insertPartyState(partyState);
        // start the event loop
        this.upNextService.startPartyEventLoop();
    }

    public removePartyByPartyId(partyId: string): void {
        this.upNextService.stopPartyByPartyId(partyId);
        this.partyStateDatabaseService.removePartyStateByPartyId(partyId);
        this.partyHistoryDatabaseService.removeHistoryForParty(partyId);
        this.userDatabaseService.removeAllUsersWithPartyId(partyId);
        this.partyDatabaseService.removePartyByPartyId(partyId);
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

    public getPartyState(partyId: string): PartyStateDB {
        return this.partyStateDatabaseService.getPartyStateByPartyId(partyId);
    }

    public getPartyFromId(partyId: string): PartyDB {
        return this.partyDatabaseService.getPartyById(partyId);
    }

    public getPlaylistForPartyId(partyId: string): Array<PlaylistEntryDB> {
        return this.playlistEntryDatabaseService.getAllPlaylistEntriesForParty(partyId);
    }

    // all of this is wrong
    public upvoteSong(partyId: string): void {
        this.playlistVoteDatabaseService.getVotesForEntry(partyId);
    }

    public addSongToPlaylist(partyId: string, userId: string, songId: string) {
        this.upNextService.emitEventToProcess(partyId, ProcessorEvents.PLAYLIST_ADD_SONG, {userId, songId});
    }

    public removeSongFromPlaylist(partyId: string, userId: string, songId: string) {
        this.upNextService.emitEventToProcess(partyId, ProcessorEvents.PLAYLIST_REMOVE_SONG, {userId, songId});
    }

    public async search(partyId: string, searchTerm: string): Promise<any> {
        const token = this.partyDatabaseService.getPartyById(partyId).spotifyToken;
        const results = await this.spotifyService.getSpotifyAPI().search.searchEverything(token, searchTerm, 20);
        return results;
    }


}