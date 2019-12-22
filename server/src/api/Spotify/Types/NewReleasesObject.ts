import PagingObject from "./PagingObject";
import SimplifiedAlbumObject from "./SimplifiedAlbumObject";

export default class FeaturedPlaylistsObject {
    public message: string;
    public albums: PagingObject<SimplifiedAlbumObject>;

    public constructor() {
    }
}
