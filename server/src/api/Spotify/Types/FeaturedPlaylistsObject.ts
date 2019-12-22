import PagingObject from "./PagingObject";
import PlaylistObject from "./PlaylistObject";

export default class FeaturedPlaylistsObject {
    public message: string;
    public playlists: PagingObject<PlaylistObject>;

    public constructor() {
    }
}
