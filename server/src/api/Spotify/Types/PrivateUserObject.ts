import FollowersObject from "./FollowersObject";
import ImageObject from "./ImageObject";

export default class PrivateUserObject {
    public country: string;
    public display_name: string;
    public email: string;
    public external_urls: any;
    public followers: FollowersObject;
    public href: string;
    public id: string;
    public images: Array<ImageObject>;
    public product: string;
    public type: string;
    public uri: string;

    public constructor() {
    }
}
