'use strict';
import SpotifyRequestBuilder from "./SpotifyRequestBuilder";

const DEFAULT_HOST = 'api.spotify.com';
const DEFAULT_SCHEME = 'https';

class WebApiRequestBuilder {
    constructor() {
    }

    static make(accessToken: string): SpotifyRequestBuilder {
        return SpotifyRequestBuilder.builder()
            .withHost(DEFAULT_HOST)
            .withScheme(DEFAULT_SCHEME)
            .withAuth(accessToken);
    }
}

export default WebApiRequestBuilder;
