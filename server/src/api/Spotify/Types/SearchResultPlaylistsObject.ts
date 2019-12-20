import PagingObject from "./PagingObject";
import SimplifiedPlaylistObject from "./SimplifiedPlaylistObject";

export default class SearchResultPlaylistsObject {
    public playlists: PagingObject<SimplifiedPlaylistObject>;

    public constructor() {
    }
}
