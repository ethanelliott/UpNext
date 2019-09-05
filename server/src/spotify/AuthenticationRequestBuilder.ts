'use strict';
import SpotifyRequestBuilder from "./SpotifyRequestBuilder";

const DEFAULT_HOST = 'accounts.spotify.com';
const DEFAULT_SCHEME = 'https';

class AuthenticationRequestBuilder {
    constructor() {
    }

    static make(): SpotifyRequestBuilder {
        return SpotifyRequestBuilder.builder()
            .withHost(DEFAULT_HOST)
            .withScheme(DEFAULT_SCHEME);
    }
}

export default AuthenticationRequestBuilder;
