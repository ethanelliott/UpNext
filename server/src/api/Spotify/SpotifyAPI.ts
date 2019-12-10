import AlbumsAPI from "./apis/AlbumsAPI";
import ArtistsAPI from "./apis/ArtistsAPI";
import BrowseAPI from "./apis/BrowseAPI";
import LibraryAPI from "./apis/LibraryAPI";
import PlayerAPI from "./apis/PlayerAPI";
import PlaylistAPI from "./apis/PlaylistAPI";
import SearchAPI from "./apis/SearchAPI";
import TracksAPI from "./apis/TracksAPI";
import UsersAPI from "./apis/UsersAPI";

export default class SpotifyAPI {
    // Sub-apis
    public albums: AlbumsAPI;
    public artists: ArtistsAPI;
    public browse: BrowseAPI;
    public library: LibraryAPI;
    public player: PlayerAPI;
    public playlist: PlaylistAPI;
    public search: SearchAPI;
    public tracks: TracksAPI;
    public users: UsersAPI;

    constructor() {
        this.albums = new AlbumsAPI();
        this.artists = new ArtistsAPI();
        this.browse = new BrowseAPI();
        this.library = new LibraryAPI();
        this.player = new PlayerAPI();
        this.playlist = new PlaylistAPI();
        this.search = new SearchAPI();
        this.tracks = new TracksAPI();
        this.users = new UsersAPI();
    }

}
