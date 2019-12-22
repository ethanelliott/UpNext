import { Service } from "typedi";
import SpotifyAPI from "../Spotify/SpotifyAPI";


@Service()
export default class SpotifyService {
    private readonly _spotifyAPI: SpotifyAPI;

    constructor() {
        this._spotifyAPI = new SpotifyAPI();
    }

    getSpotifyAPI(): SpotifyAPI {
        return this._spotifyAPI;
    }
}
