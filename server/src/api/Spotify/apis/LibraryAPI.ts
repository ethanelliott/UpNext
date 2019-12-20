import NewReleasesObject from "../Types/NewReleasesObject";
import WebAPIRequestBuilder from "../Requests/WebAPIRequestBuilder";
import { HttpMethods } from "../Types/HttpMethods";
import { plainToClass } from "class-transformer";

export default class LibraryAPI {

    constructor() {
    }

    public async getNewReleases(token: string): Promise<NewReleasesObject> {
        let d = await WebAPIRequestBuilder
            .make(token)
            .withMethod(HttpMethods.GET)
            .withPath(`/v1/browse/new-releases`)
            .withQueryParameters({country: 'from_token'})
            .build()
            .execute();
        return plainToClass(NewReleasesObject, d);
    }
}
