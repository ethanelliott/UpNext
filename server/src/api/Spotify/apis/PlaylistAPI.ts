import WebAPIRequestBuilder from "../Requests/WebAPIRequestBuilder";
import { HttpMethods } from "../Types/HttpMethods";
import { plainToClass, plainToClassFromExist } from "class-transformer";
import PlaylistSnapshotObject from "../Types/PlaylistSnapshotObject";
import PlaylistObject from "../Types/PlaylistObject";
import PagingObject from "../Types/PagingObject";
import PlaylistTrackObject from "../Types/PlaylistTrackObject";

export default class PlaylistAPI {

    constructor() {
    }

    public async addTracks(token: string, playlistId: string, uris: Array<string>): Promise<PlaylistSnapshotObject> {
        let d = await WebAPIRequestBuilder
            .make(token)
            .withMethod(HttpMethods.POST)
            .withPath(`/v1/playlists/${playlistId}/tracks`)
            .withBodyParameters({
                uris: uris.map(e => `spotify:track:${e}`)
            })
            .build()
            .execute();
        return plainToClass(PlaylistSnapshotObject, d);
    }

    public async changeDetails(token: string, playlistId: string, details: PlaylistDetails): Promise<void> {
        await WebAPIRequestBuilder
            .make(token)
            .withMethod(HttpMethods.PUT)
            .withPath(`/v1/playlists/${playlistId}`)
            .withBodyParameters({
                name: details.name,
                public: details.public,
                collaborative: details.collaborative,
                description: details.description
            })
            .build()
            .execute();
    }

    public async get(token: string, playlistId: string): Promise<PlaylistObject> {
        let d = await WebAPIRequestBuilder
            .make(token)
            .withMethod(HttpMethods.GET)
            .withPath(`/v1/playlists/${playlistId}`)
            .withQueryParameters({
                fields: 'description,name,uri,id,followers,href,images,owner,public,type,tracks.total'
            })
            .build()
            .execute();
        return plainToClass(PlaylistObject, d);
    }

    public async create(token: string, userId: string, details: PlaylistDetails): Promise<PlaylistObject> {
        let d = await WebAPIRequestBuilder
            .make(token)
            .withMethod(HttpMethods.POST)
            .withPath(`/v1/users/${userId}/playlists`)
            .withBodyParameters({
                name: details.name,
                public: details.public,
                collaborative: details.collaborative,
                description: details.description
            })
            .build()
            .execute();
        return plainToClass(PlaylistObject, d);
    }

    public async getTracks(token: string, playlistId: string, offset: number = 0, limit: number = 100): Promise<PagingObject<PlaylistTrackObject>> {
        let d = await WebAPIRequestBuilder
            .make(token)
            .withMethod(HttpMethods.GET)
            .withPath(`/v1/playlists/${playlistId}/tracks`)
            .withQueryParameters({
                market: 'from_token',
                offset,
                limit
            })
            .build()
            .execute();
        return plainToClassFromExist(new PagingObject<PlaylistTrackObject>(), d);
    }
}

export class PlaylistDetails {
    name: string;
    public: boolean;
    collaborative: boolean;
    description: string;
}
