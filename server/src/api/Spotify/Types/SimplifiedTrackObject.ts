import SimplifiedArtistObject from "./SimplifiedArtistObject";
import LinkedTrackObject from "./LinkedTrackObject";

export default class SimplifiedTrackObject {
    public artists: Array<SimplifiedArtistObject>;
    public available_markets: Array<string>;
    public disc_number: number;
    public duration_ms: number;
    public explicit: boolean;
    public external_urls: object;
    public href: string;
    public id: string;
    public is_playable: boolean;
    public linked_from: LinkedTrackObject;
    public name: string;
    public preview_url: string;
    public track_number: number;
    public type: string;
    public uri: string;

    public constructor() {
    }
}
