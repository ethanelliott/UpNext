import 'reflect-metadata';
import { ConnectedSocket, EmitOnSuccess, MessageBody, OnMessage, SocketController } from "socket-controllers";
import SocketMessage from "../Types/SocketMessage";
import PartyDBService from "../Services/PartyDBService";
import AuthenticationService from "../Services/AuthenticationService";
import UpNextService from "../Services/UpNextService";
import SpotifyService from "../Services/SpotifyService";
import logger from "../../util/Log";
import { Socket } from "socket.io";

@SocketController()
export class StateController {
    constructor(
        private authenticationService: AuthenticationService,
        private partyDBService: PartyDBService,
        private upNextService: UpNextService,
        private spotifyService: SpotifyService
    ) {
    }

    @OnMessage("get-state")
    @EmitOnSuccess("got-state")
    public async getState(@ConnectedSocket() socket: Socket, @MessageBody() message: SocketMessage<any>): Promise<SocketMessage<any>> {
        try {
            let a = this.authenticationService.authenticate(message.token);
            if (a.valid) {
                let party = this.partyDBService.findPartyById(a.data.partyId);
                // TODO move this to somewhere only the admin can see
                return {
                    token: message.token,
                    data: {
                        state: party.playState,
                        name: party.name,
                        code: party.code,
                        playlist: party.playlist,
                        colours: party.colours,
                        admin: party.admin.filter(e => e.id === a.data.userId).length > 0
                    }
                };
            } else {
                socket.emit('party-leave');
                return {
                    token: null,
                    data: null
                };
            }
        } catch (e) {
            console.log(e);
            logger.error(e);
            throw new Error('Something wrong');
        }
    }

    @OnMessage("party-fix-chrome")
    public async fixChromecastError(@MessageBody() message: SocketMessage<any>) {
        let a = this.authenticationService.authenticate(message.token);
        if (a.valid) {
            await this.upNextService.fixChromecastBug(a.data.partyId);
        } else {
            throw new Error('Invalid token! Please Leave!');
        }
    }

    @OnMessage("party-delete")
    public async deleteTheParty(@MessageBody() message: SocketMessage<any>) {
        let a = this.authenticationService.authenticate(message.token);
        if (a.valid) {
            this.upNextService.stopPartyByPartyId(a.data.partyId);
            this.partyDBService.removePartyByPartyId(a.data.partyId);
        } else {
            throw new Error('Invalid token! Please Leave!');
        }
    }

    @OnMessage("party-playback-toggle")
    public async togglePartyPlayback(@MessageBody() message: SocketMessage<any>) {
        let a = this.authenticationService.authenticate(message.token);
        if (a.valid) {
            this.upNextService.togglePlayback(a.data.partyId);
        } else {
            throw new Error('Invalid token! Please Leave!');
        }
    }

    @OnMessage("party-playback-next")
    public async partyNextSong(@MessageBody() message: SocketMessage<any>) {
        let a = this.authenticationService.authenticate(message.token);
        if (a.valid) {
            let p = this.partyDBService.findPartyById(a.data.partyId);
            if (p) {
                await this.upNextService.nextSong(p);
            } else {
                throw new Error('Nothing in the queue...');
            }
        } else {
            throw new Error('Invalid token! Please Leave!');
        }
    }

    @OnMessage("party-playback-transfer")
    public async transferPlayback(@MessageBody() message: SocketMessage<any>) {
        let a = this.authenticationService.authenticate(message.token);
        if (a.valid) {
            let p = this.partyDBService.findPartyById(a.data.partyId);
            let deviceId = message.data.deviceId;
            await this.spotifyService.getSpotifyAPI().player.transferDevice(p.token, deviceId);
        } else {
            throw new Error('Invalid token! Please Leave!');
        }
    }
}
