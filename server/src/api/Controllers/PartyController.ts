import 'reflect-metadata';
import { BodyParam, JsonController, Post, QueryParam } from 'routing-controllers';
import PartyDBService from "../Services/PartyDBService";
import WebTokenService from "../Services/WebTokenService";
import UserBuilder from "../Factory/UserBuilder";
import UUIDService from "../Services/UUIDService";
import AuthenticationService from "../Services/AuthenticationService";
import SpotifyService from "../Services/SpotifyService";
import UpNextService from "../Services/UpNextService";

@JsonController('/party')
export class PartyController {
    constructor(
        private partyDBService: PartyDBService,
        private webTokenService: WebTokenService,
        private uuidService: UUIDService,
        private authenticationService: AuthenticationService,
        private spotifyService: SpotifyService,
        private upNextService: UpNextService
    ) {
    }

    @Post('/get/all')
    public getAllParties(): any {
        return this.partyDBService.getAllParties();
    }

    @Post('/delete')
    public deleteParty(@QueryParam("id") partyId: string): any {
        this.upNextService.stopPartyByPartyId(partyId);
        this.partyDBService.removePartyByPartyId(partyId);
        return {};
    }

    @Post('/join')
    public joinParty(@QueryParam("token") token: string): any {
        let decodeToken = this.webTokenService.verify(token);
        if (decodeToken.error === null) {
            let uid = this.uuidService.new();
            let user = UserBuilder.make()
                .withId(uid)
                .withName(decodeToken.data.name)
                .build();
            this.partyDBService.newUser(
                decodeToken.data.pid,
                user
            );
            this.partyDBService.addAdminUser(decodeToken.data.pid, user);
            let userToken = this.authenticationService.generateToken(decodeToken.data.pid, uid);
            return {token: userToken};
        } else {
            return {token: ""};
        }
    }

    @Post('/validate')
    public authenticatePartyCode(@BodyParam('code') code: string, @BodyParam('name') nickName: string): any {
        let party = this.partyDBService.findPartyByCode(code);
        if (party) {
            let userJoinToken = this.webTokenService.generateFrom({
                pid: party.id,
                name: nickName,
                admin: false
            });
            return {
                valid: true,
                token: userJoinToken
            };
        } else {
            return {
                valid: false,
                token: null
            };
        }
    }

    @Post('/admin/join')
    public newAdminJoin(@BodyParam('partyId') partyId: string, @BodyParam('name') nickName: string): any {
        let party = this.partyDBService.findPartyById(partyId);
        if (party) {
            let userJoinToken = this.webTokenService.generateFrom({
                pid: party.id,
                name: nickName,
                admin: true
            });
            return {
                valid: true,
                token: userJoinToken
            };
        } else {
            return {
                valid: false,
                token: null
            };
        }
    }

    @Post('/leave')
    public leaveParty(@BodyParam('token') token: string): any {
        let decodeToken = this.webTokenService.verify(token);
        if (decodeToken.error === null) {
            this.partyDBService.removeUser(decodeToken.data.partyId, decodeToken.data.userId);
            return {
                removed: true,
                error: false
            };
        } else {
            return {
                removed: false,
                error: true
            };
        }
    }

    @Post('/recommended')
    public async getRecommended(@BodyParam('token') token: string) {
        let decodeToken = this.webTokenService.verify(token);
        if (decodeToken.error === null) {
            let party = this.partyDBService.findPartyById(decodeToken.data.partyId);
            if (party.history.length > 0) {
                let recommended = await this.spotifyService.getSpotifyAPI().browse.getRecommendations(party.token, party.history);
                return {
                    recommended
                };
            } else {
                return { };
            }
        } else {
            return null;
        }
    }

    @Post('/featured')
    public async getFeatured(@BodyParam('token') token: string) {
        let decodeToken = this.webTokenService.verify(token);
        if (decodeToken.error === null) {
            let party = this.partyDBService.findPartyById(decodeToken.data.partyId);
            let featured = await this.spotifyService.getSpotifyAPI().browse.getFeaturedPlaylists(party.token);
            return {
                featured
            };
        } else {
            return null;
        }
    }

    @Post('/fix')
    public async fixChromeError(@BodyParam('partyId') partyId: string): Promise<any> {
        await this.upNextService.fixChromecastBug(partyId);
        return {};
    }
}
