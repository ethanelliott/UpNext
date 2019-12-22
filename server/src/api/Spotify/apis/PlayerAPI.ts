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
}
