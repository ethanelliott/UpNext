import WebAPIRequestBuilder from "../Requests/WebAPIRequestBuilder";
import { HttpMethods } from "../Types/HttpMethods";
import { plainToClass } from "class-transformer";
import PagingObject from "../Types/PagingObject";
import SimplifiedAlbumObject from "../Types/SimplifiedAlbumObject";
import ArtistObject from "../Types/ArtistObject";
import TracksArray from "../Types/TracksArray";
import ArtistsArray from "../Types/ArtistsArray";

export default class ArtistsAPI {

    constructor() {
    }

    public async get(token: string, id: string): Promise<ArtistObject> {
        let d = await WebAPIRequestBuilder
            .make(token)
            .withMethod(HttpMethods.GET)
            .withPath(`/v1/artists/${id}`)
            .build()
            .execute();
        return plainToClass(ArtistObject, d);
    }

    public async getAlbums(token: string, id: string): Promise<PagingObject<SimplifiedAlbumObject>> {
        let d = await WebAPIRequestBuilder
            .make(token)
            .withMethod(HttpMethods.GET)
            .withPath(`/v1/artists/${id}/albums`)
            .withQueryParameters({country: 'from_token'})
            .build()
            .execute();
        return plainToClass(PagingObject, d) as PagingObject<SimplifiedAlbumObject>;
    }

    public async getTopTracks(token: string, id: string): Promise<TracksArray> {
        let d = await WebAPIRequestBuilder
            .make(token)
            .withMethod(HttpMethods.GET)
            .withPath(`/v1/artists/${id}/top-tracks`)
            .withQueryParameters({country: 'from_token'})
            .build()
            .execute();
        return plainToClass(TracksArray, d);
    }

    public async getRelatedArtists(token: string, id: string): Promise<ArtistsArray> {
        let d = await WebAPIRequestBuilder
            .make(token)
            .withMethod(HttpMethods.GET)
            .withPath(`/v1/artists/${id}/related-artists`)
            .withQueryParameters({country: 'from_token'})
            .build()
            .execute();
        return plainToClass(ArtistsArray, d);
    }
}
