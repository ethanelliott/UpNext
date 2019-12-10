import ExternalIdObject from "./ExternalIdObject";
import SimplifiedAlbumObject from "./SimplifiedAlbumObject";
import ArtistObject from "./ArtistObject";

export default class TrackObject {
    public album: SimplifiedAlbumObject;
    public artists: Array<ArtistObject>;
    public available_markets: Array<string>;
    public disc_number: number;
    public duration_ms: number;
    public explicit: boolean;
    public external_ids: ExternalIdObject;
    public external_urls: any;
    public href: string;
    public id: string;
    public is_playable: boolean;
    public linked_from: TrackObject;
    public restrictions: Object;
    public name: string;
    public popularity: number;
    public preview_url: string;
    public track_number: number;
    public type: string;
    public uri: string;

    public constructor() {
    }
}
