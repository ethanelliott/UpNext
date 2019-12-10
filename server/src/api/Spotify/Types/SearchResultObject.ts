import PagingObject from "./PagingObject";

export default class SearchResultObject {
    public artists: PagingObject;
    public albums: PagingObject;
    public tracks: PagingObject;
    public playlists: PagingObject;

    public constructor() {
    }
}
