import SimplifiedArtistObject from "./SimplifiedArtistObject";
import ImageObject from "./ImageObject";

export default class SimplifiedAlbumObject {
    public album_group: string;
    public album_type: string;
    public artists: Array<SimplifiedArtistObject>;
    public available_markets: Array<string>;
    public external_urls: any;
    public href: string;
    public id: string;
    public images: Array<ImageObject>;
    public name: string;
    public type: string;
    public uri: string;

    public constructor() {
    }
}
