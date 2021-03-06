import 'reflect-metadata';
import { BodyParam, ContentType, Get, JsonController, Post, QueryParam } from 'routing-controllers';
import { env } from "../../env";
import { QRService } from "../Services/QRService";
import { WebTokenService } from "../Services/WebTokenService";
import { PartyJoinToken } from "../Types/general/PartyJoinToken";
import { AuthenticationService } from "../Services/AuthenticationService";
import { PartyService } from "../Services/PartyService";
import { log } from "../../util/Log";

@JsonController('/party')
export class PartyController {
    constructor(
        private qrService: QRService,
        private webTokenService: WebTokenService,
        private authenticationService: AuthenticationService,
        private partyService: PartyService
    ) {
    }

    @Get('/all')
    public async getAllParties(): Promise<any> {
        return await this.partyService.getAllParties();
    }

    @Post('/delete')
    public async deleteParty(@QueryParam("id") partyId: string): Promise<any> {
        await this.partyService.removePartyByPartyId(partyId);
        return {};
    }

    @Post('/join')
    public async joinParty(@QueryParam("token") token: string): Promise<any> {
        const decodedToken = this.webTokenService.verify<PartyJoinToken>(token);
        if (decodedToken.error == null) {
            let userId;
            if (decodedToken.data.insert) {
                await this.partyService.removeUserByTrackingId(decodedToken.data.trackingId);
                userId = await this.partyService.joinParty(decodedToken.data);
            } else {
                const userParties = await this.partyService.getUserByTrackingId(decodedToken.data.trackingId);
                if (userParties.length === 1) {
                    const user = userParties[0];
                    userId = user.id;
                }
            }
            const userToken = this.authenticationService.generateToken(decodedToken.data.partyId, userId, decodedToken.data.admin);
            return {token: userToken, userId};
        } else {
            return {token: null};
        }
    }

    @Post('/rejoin')
    public async rejoinParty(@BodyParam('trackingId') trackingId: string): Promise<any> {
        const userParties = await this.partyService.getUserByTrackingId(trackingId);
        if (userParties.length === 1) {
            const user = userParties[0];
            const party = await this.partyService.getPartyById(user.partyId);
            const userJoinToken = this.webTokenService.generateFrom({
                partyId: party.id,
                name: user.nickname,
                admin: false,
                trackingId,
                insert: false
            });
            return {valid: true, token: userJoinToken};
        } else {
            return {valid: false, token: null};
        }
    }

    @Post('/validate')
    public async authenticatePartyCode(@BodyParam('code') code: string, @BodyParam('name') nickName: string, @BodyParam('trackingId') trackingId: string,): Promise<any> {
        const partyId = await this.partyService.getPartyIdFromCode(code);
        if (partyId) {
            const userJoinToken = this.webTokenService.generateFrom({
                partyId,
                name: nickName,
                admin: false,
                trackingId,
                insert: true
            });
            return {valid: true, token: userJoinToken};
        } else {
            return {valid: false, token: null};
        }
    }

    @Post('/admin/join')
    public newAdminJoin(@BodyParam('partyId') partyId: string, @BodyParam('name') nickName: string): any {
        return {
            valid: true,
            token: this.webTokenService.generateFrom({
                pid: partyId,
                name: nickName,
                admin: true
            })
        };
    }

    @Post('/leave')
    public async leaveParty(@BodyParam('token') token: string): Promise<any> {
        const data = await this.authenticationService.authenticate(token);
        log.info(`[PARTY] User Leaving ${data.userId}`);
        return {};
    }

    @Get('/qr.png')
    @ContentType('image/png')
    public async shareQRCode(@QueryParam('code') code: string, @QueryParam('back') back: string, @QueryParam('front') front: string) {
        const data = await this.qrService.generateFrom(`${env.app.front.url}/join?c=${code}`, `#${front}ff`, `#${back}ff`);
        return Buffer.from(data.split(',')[1], 'base64');
    }
}
