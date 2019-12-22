import PagingObject from "./PagingObject";
import SimplifiedAlbumObject from "./SimplifiedAlbumObject";
import SimplifiedPlaylistObject from "./SimplifiedPlaylistObject";
import TrackObject from "./TrackObject";
import ArtistObject from "./ArtistObject";

export default class SearchResultAllObject {
    public artists: PagingObject<ArtistObject>;
    public albums: PagingObject<SimplifiedAlbumObject>;
    public tracks: PagingObject<TrackObject>;
    public playlists: PagingObject<SimplifiedPlaylistObject>;

    public constructor() {
    }
}
