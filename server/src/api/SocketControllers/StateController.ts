import 'reflect-metadata';
import { EmitOnFail, EmitOnSuccess, MessageBody, OnMessage, SocketController } from "socket-controllers";
import SocketMessage from "../Types/SocketMessage";
import PartyDBService from "../Services/PartyDBService";
import AuthenticationService from "../Services/AuthenticationService";
import UpNextService from "../Services/UpNextService";
import SpotifyService from "../Services/SpotifyService";

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
    @EmitOnFail("party-leave")
    public async getState(@MessageBody() message: SocketMessage<any>): Promise<SocketMessage<any>> {
        let a = this.authenticationService.authenticate(message.token);
        if (a.valid) {
            let party = this.partyDBService.findPartyById(a.data.partyId);
            let devices = await this.spotifyService.getSpotifyAPI().player.getDevices(party.token);
            return {
                token: message.token,
                data: {
                    state: party.playState,
                    name: party.name,
                    code: party.code,
                    playlist: party.playlist,
                    colours: party.colours,
                    admin: party.admin.id === a.data.userId,
                    devices: devices
                }
            };
        } else {
            throw new Error('Invalid token! Please Leave!');
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
