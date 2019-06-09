'use strict'
const {RequestBuilder} = require('./RequestBuilder')

const DEFAULT_HOST = 'api.spotify.com'
const DEFAULT_SCHEME = 'https'

class SpotifyAPIBuilder {
    constructor() {
    }

    static builder(accessToken) {
        return RequestBuilder
            .builder()
            .withHost(DEFAULT_HOST)
            .withScheme(DEFAULT_SCHEME)
            .withAuth(accessToken)
    }
}

module.exports = {
    SpotifyAPIBuilder
}
