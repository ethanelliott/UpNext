import { plainToClass } from "class-transformer";
import WebAPIRequestBuilder from "../Requests/WebAPIRequestBuilder";
import { HttpMethods } from "../Types/HttpMethods";
import CurrentlyPlayingObject from "../Types/CurrentlyPlayingObject";
import DevicesObject from "../Types/DevicesObject";

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

    public async getDevices(token: string): Promise<DevicesObject> {
        let d = await WebAPIRequestBuilder
            .make(token)
            .withMethod(HttpMethods.GET)
            .withPath("/v1/me/player/devices")
            .build()
            .execute();
        return plainToClass(DevicesObject, d);
    }

    public async transferDevice(token: string, deviceId: string): Promise<DevicesObject> {
        let d = await WebAPIRequestBuilder
            .make(token)
            .withMethod(HttpMethods.PUT)
            .withPath("/v1/me/player")
            .withBodyParameters({
                device_ids: [deviceId],
                play: true
            })
            .build()
            .execute();
        return plainToClass(DevicesObject, d);
    }

    public async nextSong(token: string): Promise<void> {
        await WebAPIRequestBuilder
            .make(token)
            .withMethod(HttpMethods.POST)
            .withPath("/v1/me/player/next")
            .build()
            .execute();
    }

    public async addSongToEndOfQueue(token: string, trackId: string): Promise<void> {
        await WebAPIRequestBuilder
            .make(token)
            .withMethod(HttpMethods.POST)
            .withPath("/v1/me/player/queue")
            .withQueryParameters({uri: `spotify:track:${trackId}`})
            .build()
            .execute();
    }
}
