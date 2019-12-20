import WebAPIRequestBuilder from "../Requests/WebAPIRequestBuilder";
import { HttpMethods } from "../Types/HttpMethods";
import { plainToClass } from "class-transformer";
import SearchResultAllObject from "../Types/SearchResultAllObject";
import SearchResultTracksObject from "../Types/SearchResultTracksObject";
import SearchResultAlbumsObject from "../Types/SearchResultAlbumsObject";
import SearchResultArtistsObject from "../Types/SearchResultArtistsObject";
import SearchResultPlaylistsObject from "../Types/SearchResultPlaylistsObject";

export default class SearchAPI {
    private static ALL_TYPES = ['album', 'artist', 'playlist', 'track'];

    constructor() {
    }

    // this is a wild function... better to not use it
    public async search(token: string, query: string, types: Array<string>, limit: number): Promise<SearchResultAllObject | SearchResultAlbumsObject | SearchResultArtistsObject | SearchResultTracksObject | SearchResultPlaylistsObject> {
        let d = await WebAPIRequestBuilder
            .make(token)
            .withMethod(HttpMethods.GET)
            .withPath(`/v1/search`)
            .withQueryParameters({
                q: query,
                type: types.join(','),
                market: 'from_token',
                limit: limit,
                offset: 0
            })
            .build()
            .execute();
        return plainToClass(SearchResultAllObject, d);
    }

    public async searchEverything(token: string, query: string): Promise<SearchResultAllObject> {
        let d = await WebAPIRequestBuilder
            .make(token)
            .withMethod(HttpMethods.GET)
            .withPath(`/v1/search`)
            .withQueryParameters({
                q: query,
                type: SearchAPI.ALL_TYPES.join(','),
                market: 'from_token',
                limit: 1,
                offset: 0
            })
            .build()
            .execute();
        return plainToClass(SearchResultAllObject, d);
    }

    public async searchAlbums(token: string, query: string): Promise<SearchResultAlbumsObject> {
        let d = await WebAPIRequestBuilder
            .make(token)
            .withMethod(HttpMethods.GET)
            .withPath(`/v1/search`)
            .withQueryParameters({
                q: query,
                type: SearchAPI.ALL_TYPES.join(','),
                market: 'from_token',
                limit: 1,
                offset: 0
            })
            .build()
            .execute();
        return plainToClass(SearchResultAlbumsObject, d);
    }

    public async searchArtists(token: string, query: string): Promise<SearchResultArtistsObject> {
        let d = await WebAPIRequestBuilder
            .make(token)
            .withMethod(HttpMethods.GET)
            .withPath(`/v1/search`)
            .withQueryParameters({
                q: query,
                type: SearchAPI.ALL_TYPES.join(','),
                market: 'from_token',
                limit: 1,
                offset: 0
            })
            .build()
            .execute();
        return plainToClass(SearchResultArtistsObject, d);
    }

    public async searchTracks(token: string, query: string): Promise<SearchResultTracksObject> {
        let d = await WebAPIRequestBuilder
            .make(token)
            .withMethod(HttpMethods.GET)
            .withPath(`/v1/search`)
            .withQueryParameters({
                q: query,
                type: SearchAPI.ALL_TYPES.join(','),
                market: 'from_token',
                limit: 1,
                offset: 0
            })
            .build()
            .execute();
        return plainToClass(SearchResultTracksObject, d);
    }
}
