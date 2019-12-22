import PagingObject from "./PagingObject";
import SimplifiedAlbumObject from "./SimplifiedAlbumObject";

export default class SearchResultAlbumsObject {
    public albums: PagingObject<SimplifiedAlbumObject>;

    public constructor() {
    }
}
