const {logger} = require('../general/logger')
const {get, post, put} = require('./requests')
const {client_id, client_secret} = require('../creds')

const API_URLS = {
    'get_auth_token': () => `https://accounts.spotify.com/api/token`,
    'renew_auth_token': () => `https://accounts.spotify.com/api/token`,
    'get_user_data_me': () => `https://api.spotify.com/v1/me`,
    'get_player_data': () => `https://api.spotify.com/v1/me/player`,
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

let _instance = null

class SPOTIFY_API {
    constructor() {
        this.client_id = client_id
        this.client_secret = client_secret
        logger.info('New Spotify API initialized')
    }

    static getInstance() {
        if (!!!_instance) {
            _instance = new SPOTIFY_API()
        }
        return _instance
    }

    static getHeader(token) {
        return {
            'Authorization': `Bearer ${token}`
        }
    }

    recursiveGetItems(url, token, array) {
        return get(url, SPOTIFY_API.getHeader(token)).then((response) => {
            array.push(...response.data.items)
            if (response.data.next !== null) {
                return this.recursiveGetItems(response.data.next, token, array)
            }
        })
    }

    getAuthToken(code, redirectURL) {
        return new Promise((resolve, reject) => {
            post(
                API_URLS.get_auth_token(),
                null,
                {
                    code: code,
                    redirect_uri: redirectURL, //base_uri_api + "/party/auth-callback",
                    grant_type: 'authorization_code'
                },
                {
                    'Authorization': 'Basic ' + Buffer.from(`${this.client_id}:${this.client_secret}`).toString('base64')
                }
            ).then((response) => {
                resolve({
                    access_token: response.data.access_token,
                    refresh_token: response.data.refresh_token,
                    expires_at: (new Date()).valueOf() + (1000 * response.data.expires_in)
                })
            }).catch(error => {
                logger.error(error)
                reject(error)
            })
        })
    }

    refreshAuthToken(refreshToken) {
        return new Promise((resolve, reject) => {
            post(
                API_URLS.renew_auth_token(),
                null,
                {
                    refresh_token: refreshToken,
                    grant_type: 'refresh_token'
                },
                {
                    'Authorization': 'Basic ' + Buffer.from(this.client_id + ':' + this.client_secret).toString('base64')
                }
            ).then((response) => {
                resolve({
                    access_token: response.data.access_token,
                    refresh_token: refreshToken,
                    expires_at: (new Date()).valueOf() + (1000 * response.data.expires_in)
                })
            }).catch((error) => {
                logger.error(error)
                reject(error)
            })
        })
    }

    getUserData(token) {
        return new Promise((resolve, reject) => {
            get(
                API_URLS.get_user_data_me(),
                SPOTIFY_API.getHeader(token)
            ).then((response) => {
                resolve(response.data)
            }).catch((error) => {
                logger.error(error)
                reject(error)
            })
        })

    }

    getPlayerData(token) {
        return new Promise((resolve, reject) => {
            get(
                API_URLS.get_player_data(),
                SPOTIFY_API.getHeader(token)
            ).then((response) => {
                resolve(response.data)
            }).catch((error) => {
                logger.error(error)
                reject(error)
            })
        })
    }

    search(token, searchTerms) {
        return new Promise((resolve, reject) => {
            get(
                API_URLS.search(searchTerms),
                SPOTIFY_API.getHeader(token)
            ).then((response) => {
                resolve(response.data)
            }).catch((error) => {
                logger.error(error)
                reject(error)
            })
        })
    }

    getTrack(token, trackID) {
        return new Promise((resolve, reject) => {
            get(
                API_URLS.get_track(trackID),
                SPOTIFY_API.getHeader(token)
            ).then((response) => {
                resolve(response.data)
            }).catch((error) => {
                logger.error(error)
                reject(error)
            })
        })
    }

    getAlbum(token, albumID) {
        return new Promise((resolve, reject) => {
            get(
                API_URLS.get_album(albumID),
                SPOTIFY_API.getHeader(token)
            ).then((response) => {
                resolve(response.data)
            }).catch((error) => {
                logger.error(error)
                reject(error)
            })
        })
    }


    getArtistAlbums(token, artistID) {
        return new Promise((resolve, reject) => {
            let album_array = []
            this.recursiveGetItems(
                API_URLS.get_artist_albums(artistID),
                token,
                album_array
            ).then(() => {
                resolve(album_array)
            }).catch((error) => {
                logger.error(error)
                reject(error)
            })
        })
    }

    getArtist(token, artistID) {
        return new Promise((resolve, reject) => {
            get(
                API_URLS.get_artist(artistID),
                SPOTIFY_API.getHeader(token)
            ).then((response) => {
                resolve(response.data)
            }).catch((error) => {
                logger.error(error)
                reject(error)
            })
        })
    }

    getArtistTopTracks(token, artistID) {
        return new Promise((resolve, reject) => {
            get(
                API_URLS.get_artist_top_tracks(artistID),
                SPOTIFY_API.getHeader(token)
            ).then((response) => {
                resolve(response.data)
            }).catch((error) => {
                logger.error(error)
                reject(error)
            })
        })
    }

    getPlaylistTracks(token, playlistID) {
        return new Promise((resolve, reject) => {
            let track_array = []
            this.recursiveGetItems(
                API_URLS.get_playlist_tracks(playlistID),
                token,
                track_array
            ).then(() => {
                resolve(track_array)
            }).catch((error) => {
                logger.error(error)
                reject(error)
            })
        })
    }

    getPlaylist(token, playlistID) {
        return new Promise((resolve, reject) => {
            get(
                API_URLS.get_playlist(playlistID),
                SPOTIFY_API.getHeader(token)
            ).then((response) => {
                resolve(response.data)
            }).catch((error) => {
                logger.error(error)
                reject(error)
            })
        })
    }

    createPlaylist(token, userID, name, description) {
        return new Promise((resolve, reject) => {
            post(
                API_URLS.create_playlist(userID),
                {
                    name: name, //name + ' By UpNext 🎵',
                    description: description, //name + " archive, brought to you by UpNext",
                    public: false,
                    collaborative: false
                },
                null,
                SPOTIFY_API.getHeader(token)
            ).then((response) => {
                resolve(response.data)
            }).catch((error) => {
                logger.error(error)
                reject(error)
            })
        })
    }

    addTrackToPlaylist(token, playlistID, songID) {
        return new Promise((resolve, reject) => {
            post(
                API_URLS.add_track_playlist(playlistID),
                [`spotify:track:${songID}`],
                null,
                SPOTIFY_API.getHeader(token)
            ).then((response) => {
                resolve(response.data)
            }).catch((error) => {
                logger.error(error)
                reject(error)
            })
        })
    }

    playerPlaySong(token, songID) {
        return new Promise((resolve, reject) => {
            put(
                API_URLS.player_play(),
                {uris: [`spotify:track:${songID}`]},
                SPOTIFY_API.getHeader(token)
            ).then((response) => {
                resolve(response.data)
            }).catch((error) => {
                logger.error(error)
                reject(error)
            })
        })
    }

    playerPlay(token) {
        return new Promise((resolve, reject) => {
            put(
                API_URLS.player_play(),
                null,
                SPOTIFY_API.getHeader(token)
            ).then((response) => {
                resolve(response.data)
            }).catch((error) => {
                logger.error(error)
                reject(error)
            })
        })
    }

    playerPause(token) {
        return new Promise((resolve, reject) => {
            put(
                API_URLS.player_pause(),
                null,
                SPOTIFY_API.getHeader(token)
            ).then((response) => {
                resolve(response.data)
            }).catch((error) => {
                logger.error(error)
                reject(error)
            })
        })
    }
}

module.exports = {
    SPOTIFY_API
}


// get(
//
// ).then((response) => {
//
// }).catch((error) => {
//     logger.error(error)
// })
