import FollowersObject from "./FollowersObject";
import ImageObject from "./ImageObject";

export default class PublicUserObject {
    public display_name: string;
    public external_urls: any;
    public followers: FollowersObject;
    public href: string;
    public id: string;
    public images: Array<ImageObject>;
    public type: string;
    public uri: string;

    public constructor() {
    }
}
