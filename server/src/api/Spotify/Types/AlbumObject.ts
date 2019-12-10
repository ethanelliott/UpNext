import ArtistObject from "./ArtistObject";
import ExternalIdObject from "./ExternalIdObject";
import SimplifiedTrackObject from "./SimplifiedTrackObject";
import CopyrightObject from "./CopyrightObject";
import ImageObject from "./ImageObject";

export default class AlbumObject {
    public album_type: string;
    public artists: Array<ArtistObject>;
    public available_markets: Array<string>;
    public copyrights: Array<CopyrightObject>;
    public external_ids: ExternalIdObject;
    public external_urls: Object;
    public genres: Array<string>;
    public href: string;
    public id: string;
    public images: Array<ImageObject>;
    public label: string;
    public name: string;
    public popularity: number;
    public release_date: string;
    public release_date_precision: string;
    public tracks: Array<SimplifiedTrackObject>;
    public type: string;
    public uri: string;

    public constructor() {
    }
}
