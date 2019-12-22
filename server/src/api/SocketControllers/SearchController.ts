import 'reflect-metadata';
import SpotifyService from "../Services/SpotifyService";
import { MessageBody, OnMessage, SocketController } from "socket-controllers";
import SocketMessage from "../Types/SocketMessage";
import AuthenticationService from "../Services/AuthenticationService";

@SocketController()
export class SearchController {
    constructor(
        private spotifyService: SpotifyService,
        private authenticationService: AuthenticationService
    ) {
    }

    @OnMessage("search")
    public async search(@MessageBody() message: SocketMessage<any>) {
        let a = this.authenticationService.authenticate(message.token);
        if (a.valid) {
            let x = await this.spotifyService.getSpotifyAPI().search.searchEverything('', '');
            return x;
        } else {
            return "";
        }
    }
}
