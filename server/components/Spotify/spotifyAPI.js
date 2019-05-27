const {logger} = require('../general/logger')
const {get, post, put} = require('./requests')

let _instance = null

const API_URLS = {
    'get_auth_token': () => `https://accounts.spotify.com/api/token`,
    'renew_auth_token': () => `https://accounts.spotify.com/api/token`,
    'get_user_data': () => `https://api.spotify.com/v1/me`,
    'search': (searchTerms) => `https://api.spotify.com/v1/search/?q=${encodeURI(searchTerms)}&type=track%2Cartist%2Cplaylist%2Calbum&market=from_token`,
    'get_track': (trackID) => `https://api.spotify.com/v1/tracks/${trackID}`,
    'get_album': (albumID) => `https://api.spotify.com/v1/albums/${albumID}`,
    'get_artist_albums': (artistID) => `https://api.spotify.com/v1/artists/${artistID}/albums?offset=0&limit=50&include_groups=album,single&market=from_token`,
    'get_artist': (artistID) => `https://api.spotify.com/v1/artists/${artistID}`,
    'get_artist_top_tracks': (artistID) => `https://api.spotify.com/v1/artists/${artistID}/top-tracks?country=from_token`,
    'get_playlist_tracks': (playlistID) => `https://api.spotify.com/v1/playlists/${playlistID}/tracks?offset=0&limit=100`,
    'get_playlist': (playlistID) => `https://api.spotify.com/v1/playlists/${playlistID}`,
    'create_playlist': (userID) => `https://api.spotify.com/v1/users/${userID}/playlists`,
    'add_track_playlist': (playlistID) => `https://api.spotify.com/v1/playlists/${playlistID}/tracks`,
    'player_play': () => `https://api.spotify.com/v1/me/player/play`,
    'player_pause': () => `https://api.spotify.com/v1/me/player/pause`,
}

class SPOTIFY_API {
    constructor() {
        logger.info('New Spotify API initialized')
    }

    static getInstance() {
        if (!!!_instance) {
            _instance = new SPOTIFY_API()
        }
        return _instance
    }

    initialize(client_id, client_secret) {
        this.client_id = client_id
        this.client_secret = client_secret
        return this
    }

    getAuthToken() {

    }

    refrechAuthToken() {

    }

    getUserData() {

    }

    search() {

    }

    getTrack() {

    }

    getAlbum() {

    }

    getArtistAlbums() {

    }

    getArtist() {

    }

    getPLaylistTracks() {

    }

    getPlaylist() {

    }

    createPlaylist() {

    }

    addTrackToPlaylist() {

    }

    playerPlay() {

    }

    playerPause() {

    }

}


module.exports = {
    SPOTIFY_API
}
