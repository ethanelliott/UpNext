import WebAPIRequestBuilder from "../Requests/WebAPIRequestBuilder";
import { HttpMethods } from "../Types/HttpMethods";
import { plainToClass } from "class-transformer";
import AlbumObject from "../Types/AlbumObject";
import SimplifiedTrackObject from "../Types/SimplifiedTrackObject";
import PagingObject from "../Types/PagingObject";

export default class AlbumsAPI {

    constructor() {
    }

    public async getAlbum(token: string, id: string): Promise<AlbumObject> {
        let d = await WebAPIRequestBuilder
            .make(token)
            .withMethod(HttpMethods.GET)
            .withPath(`/v1/albums/${id}`)
            .withQueryParameters({country: 'from_token'})
            .build()
            .execute();
        return plainToClass(AlbumObject, d);
    }

    public async getAlbumTracks(token: string, id: string): Promise<PagingObject<SimplifiedTrackObject>> {
        let d = await WebAPIRequestBuilder
            .make(token)
            .withMethod(HttpMethods.GET)
            .withPath(`/v1/albums/${id}/tracks`)
            .withQueryParameters({country: 'from_token'})
            .build().execute();
        return plainToClass(PagingObject, d) as PagingObject<SimplifiedTrackObject>;
    }

}
