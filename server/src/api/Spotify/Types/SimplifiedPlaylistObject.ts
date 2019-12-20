import ImageObject from "./ImageObject";
import PublicUserObject from "./PublicUserObject";
import PlaylistTrackObject from "./PlaylistTrackObject";

export default class SimplifiedPlaylistObject {
    public collaborative: boolean;
    public external_urls: any;
    public href: string;
    public id: string;
    public images: Array<ImageObject>;
    public name: string;
    public owner: PublicUserObject;
    public public: boolean;
    public snapshot_id: string;
    public tracks: Array<PlaylistTrackObject>;

    public constructor() {
    }
}
