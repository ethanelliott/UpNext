import WebAPIRequestBuilder from "../Requests/WebAPIRequestBuilder";
import { HttpMethods } from "../Types/HttpMethods";
import { plainToClass } from "class-transformer";
import TrackObject from "../Types/TrackObject";
import AudioFeaturesObject from "../Types/AudioFeatureObject";

export default class TracksAPI {

    constructor() {
    }

    public async getTrack(token: string, trackId: string): Promise<TrackObject> {
        let d = await WebAPIRequestBuilder
            .make(token)
            .withMethod(HttpMethods.GET)
            .withPath(`/v1/tracks/${trackId}`)
            .withQueryParameters({
                market: 'from_token'
            })
            .build()
            .execute();
        return plainToClass(TrackObject, d);
    }

    public async getAudioFeatures(token: string, trackId: string): Promise<AudioFeaturesObject> {
        let d = await WebAPIRequestBuilder
            .make(token)
            .withMethod(HttpMethods.GET)
            .withPath(`/v1/audio-features/${trackId}`)
            .build()
            .execute();
        return plainToClass(AudioFeaturesObject, d);
    }

    // Need to add the AudioAnalysisObject
    // public async getAudioAnalysis(token: string, trackId: string): Promise<AudioAnalysisObject> {
    //     let d = await WebAPIRequestBuilder
    //         .make(token)
    //         .withMethod(HttpMethods.GET)
    //         .withPath(`/v1/audio-analysis/${trackId}`)
    //         .build()
    //         .execute();
    //     return plainToClass(AudioAnalysisObject, d);
    // }
}
