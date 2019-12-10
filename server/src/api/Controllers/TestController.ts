import 'reflect-metadata';
import { Get, JsonController } from 'routing-controllers';
import SpotifyAPI from "../Spotify/SpotifyAPI";
import CurrentlyPlayingObject from "../Spotify/Types/CurrentlyPlayingObject";

@JsonController('/test')
export class TestController {

    constructor() {
    }

    @Get()
    public async test(): Promise<CurrentlyPlayingObject> {
        let spotify = new SpotifyAPI();
        return await spotify.player.getPlayingContext("");
    }
}
