import FollowersObject from "./FollowersObject";
import ImageObject from "./ImageObject";

export default class ArtistObject {
    public external_urls: Object;
    public followers: FollowersObject;
    public genres: Array<string>;
    public href: string;
    public id: string;
    public images: Array<ImageObject>;
    public name: string;
    public popularity: number;
    public type: string;
    public uri: string;

    public constructor() {
    }
}
