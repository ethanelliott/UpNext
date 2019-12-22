import { plainToClass } from "class-transformer";
import WebAPIRequestBuilder from "../Requests/WebAPIRequestBuilder";
import { HttpMethods } from "../Types/HttpMethods";
import CurrentlyPlayingObject from "../Types/CurrentlyPlayingObject";

export default class PlayerAPI {

    constructor() {
    }

    public async getPlayingContext(token: string): Promise<CurrentlyPlayingObject> {
        let d = await WebAPIRequestBuilder
            .make(token)
            .withMethod(HttpMethods.GET)
            .withPath("/v1/me/player")
            .build()
            .execute();
        return plainToClass(CurrentlyPlayingObject, d);
    }

    public async pause(token: string): Promise<void> {
        await WebAPIRequestBuilder
            .make(token)
            .withMethod(HttpMethods.PUT)
            .withPath("/v1/me/player/pause")
            .build()
            .execute();
    }

    public async play(token: string): Promise<void> {
        await WebAPIRequestBuilder
            .make(token)
            .withMethod(HttpMethods.PUT)
            .withPath("/v1/me/player/play")
            .build()
            .execute();
    }

    public async playSong(token: string, songId: string): Promise<void> {
        await WebAPIRequestBuilder
            .make(token)
            .withMethod(HttpMethods.PUT)
            .withPath("/v1/me/player/play")
            .withBodyParameters({
                uris: [`spotify:track:${songId}`]
            })
            .build()
            .execute();
    }
}
