import WebAPIRequestBuilder from "../Requests/WebAPIRequestBuilder";
import { HttpMethods } from "../Types/HttpMethods";
import { plainToClass } from "class-transformer";
import CategoryArray from "../Types/CategoryArray";
import FeaturedPlaylistsObject from "../Types/FeaturedPlaylistsObject";
import NewReleasesObject from "../Types/NewReleasesObject";
import RecommendationsResponseObject from "../Types/RecommendationsResponseObject";

// TODO: continue adding the other functions
export default class BrowseAPI {

    constructor() {
    }

    public async getCategories(token: string): Promise<CategoryArray> {
        let d = await WebAPIRequestBuilder
            .make(token)
            .withMethod(HttpMethods.GET)
            .withPath(`/v1/browse/categories`)
            .withQueryParameters({country: 'from_token'})
            .build()
            .execute();
        return plainToClass(CategoryArray, d);
    }

    public async getFeaturedPlaylists(token: string): Promise<FeaturedPlaylistsObject> {
        let d = await WebAPIRequestBuilder
            .make(token)
            .withMethod(HttpMethods.GET)
            .withPath(`/v1/browse/featured-playlists`)
            .withQueryParameters({country: 'from_token'})
            .build()
            .execute();
        return plainToClass(FeaturedPlaylistsObject, d);
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

    public async getRecommendations(token: string, seeds: Array<string>): Promise<RecommendationsResponseObject> {
        let d = await WebAPIRequestBuilder
            .make(token)
            .withMethod(HttpMethods.GET)
            .withPath(`/v1/recommendations`)
            .withQueryParameters({
                market: 'from_token',
                seed_tracks: seeds.join(',')
            })
            .build()
            .execute();
        return plainToClass(RecommendationsResponseObject, d);
    }
}
