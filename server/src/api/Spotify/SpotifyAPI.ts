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
    private accessToken: string;

    constructor(accessToken: string) {
        this.accessToken = accessToken;

        this.albums = new AlbumsAPI(accessToken);
        this.artists = new ArtistsAPI(accessToken);
        this.browse = new BrowseAPI(accessToken);
        this.library = new LibraryAPI(accessToken);
        this.player = new PlayerAPI(accessToken);
        this.playlist = new PlaylistAPI(accessToken);
        this.search = new SearchAPI(accessToken);
        this.tracks = new TracksAPI(accessToken);
        this.users = new UsersAPI(accessToken);
    }

}
