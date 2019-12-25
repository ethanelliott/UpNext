import 'reflect-metadata';
import SpotifyService from "../Services/SpotifyService";
import { EmitOnFail, EmitOnSuccess, MessageBody, OnMessage, SocketController } from "socket-controllers";
import SocketMessage from "../Types/SocketMessage";
import AuthenticationService from "../Services/AuthenticationService";
import PartyDBService from "../Services/PartyDBService";

@SocketController()
export class SearchController {
    constructor(
        private spotifyService: SpotifyService,
        private authenticationService: AuthenticationService,
        private partyDBService: PartyDBService
    ) {
    }

    @OnMessage("search")
    @EmitOnSuccess("search-success")
    @EmitOnFail("search-fail")
    public async search(@MessageBody() message: SocketMessage<any>) {
        let a = this.authenticationService.authenticate(message.token);
        if (a.valid) {
            let token = this.partyDBService.getTokenFromParty(a.data.partyId);
            let q = message.data.query;
            let x = await this.spotifyService.getSpotifyAPI().search.searchEverything(token, q);
            return x;
        } else {
            return "";
        }
    }
}
