'use strict';
import { Credentials } from "./types/credentials";
import { AxiosResponse } from "axios";
import WebApiRequestBuilder from "./WebApiRequestBuilder";
import AuthenticationRequestBuilder from "./AuthenticationRequestBuilder";

class SpotifyApi {
    private _credentials: Credentials;

    constructor(clientID: string, clientSecret: string, accessToken: string, refreshToken: string, redirectURI: string) {
        this._credentials.clientID = clientID;
        this._credentials.clientSecret = clientSecret;
        this._credentials.accessToken = accessToken;
        this._credentials.refreshToken = refreshToken;
        this._credentials.redirectURI = redirectURI;
    }

    getTrack(trackID: string, options?: object): Promise<AxiosResponse> {
        return WebApiRequestBuilder.make(this._credentials.accessToken)
            .withMethod(AxiosMethod.GET)
            .withPath(`/v1/tracks/${trackID}`)
            .withQueryParameters(options)
            .build()
            .execute();
    }

    getTracks(trackIDs: string[], options?: object): Promise<AxiosResponse> {
        return WebApiRequestBuilder.make(this._credentials.accessToken)
            .withMethod(AxiosMethod.GET)
            .withPath(`/v1/tracks`)
            .withQueryParameters(Object.assign(
                options,
                {
                    ids: trackIDs.join(',')
                })
            )
            .build()
            .execute();
    }

    getAlbum(albumID: string, options?: object): Promise<AxiosResponse> {
        return WebApiRequestBuilder.make(this._credentials.accessToken)
            .withMethod(AxiosMethod.GET)
            .withPath(`/v1/albums/${albumID}`)
            .withQueryParameters(options)
            .build()
            .execute();
    }

    getAlbums(albumIDs: string[], options?: object): Promise<AxiosResponse> {
        return WebApiRequestBuilder.make(this._credentials.accessToken)
            .withMethod(AxiosMethod.GET)
            .withPath(`/v1/albums`)
            .withQueryParameters(Object.assign(
                options,
                {
                    ids: albumIDs.join(',')
                })
            )
            .build()
            .execute();
    }

    getArtist(artistID: string, options?: object): Promise<AxiosResponse> {
        return WebApiRequestBuilder.make(this._credentials.accessToken)
            .withMethod(AxiosMethod.GET)
            .withPath(`/v1/artists/${artistID}`)
            .withQueryParameters(options)
            .build()
            .execute();
    }

    getArtists(artistIDs: string[], options?: object): Promise<AxiosResponse> {
        return WebApiRequestBuilder.make(this._credentials.accessToken)
            .withMethod(AxiosMethod.GET)
            .withPath(`/v1/artists`)
            .withQueryParameters(Object.assign(
                options,
                {
                    ids: artistIDs.join(',')
                })
            )
            .build()
            .execute();
    }

    search(query: string, types: string[], options?: object): Promise<AxiosResponse> {
        return WebApiRequestBuilder.make(this._credentials.accessToken)
            .withMethod(AxiosMethod.GET)
            .withPath(`/v1/search`)
            .withQueryParameters(Object.assign(
                options,
                {
                    type: types.join(','),
                    q: query
                })
            )
            .build()
            .execute();
    }

    searchAlbums(query: string, options?: object): Promise<AxiosResponse> {
        return this.search(query, ['album'], options);
    }

    searchArtists(query: string, options?: object): Promise<AxiosResponse> {
        return this.search(query, ['artist'], options);
    }

    searchTracks(query: string, options?: object): Promise<AxiosResponse> {
        return this.search(query, ['track'], options);
    }

    searchPlaylists(query: string, options?: object): Promise<AxiosResponse> {
        return this.search(query, ['playlist'], options);
    }

    getArtistAlbums(artistID: string, options?: object): Promise<AxiosResponse> {
        return WebApiRequestBuilder.make(this._credentials.accessToken)
            .withMethod(AxiosMethod.GET)
            .withPath(`/v1/artists/${artistID}/albums`)
            .withQueryParameters(options)
            .build()
            .execute();
    }

    getAlbumTracks(artistID: string, options?: object): Promise<AxiosResponse> {
        return WebApiRequestBuilder.make(this._credentials.accessToken)
            .withMethod(AxiosMethod.GET)
            .withPath(`/v1/artists/${artistID}/tracks`)
            .withQueryParameters(options)
            .build()
            .execute();
    }

    getArtistTopTracks(artistID: string, country: string): Promise<AxiosResponse> {
        return WebApiRequestBuilder.make(this._credentials.accessToken)
            .withMethod(AxiosMethod.GET)
            .withPath(`/v1/artists/${artistID}/top-tracks`)
            .withQueryParameters({
                'country': country
            })
            .build()
            .execute();
    }

    getArtistRelatedArtists(artistID: string): Promise<AxiosResponse> {
        return WebApiRequestBuilder.make(this._credentials.accessToken)
            .withMethod(AxiosMethod.GET)
            .withPath(`/v1/artists/${artistID}/related-artists`)
            .build()
            .execute();
    }

    getUser(userID: string): Promise<AxiosResponse> {
        return WebApiRequestBuilder.make(this._credentials.accessToken)
            .withMethod(AxiosMethod.GET)
            .withPath(`/v1/users/${encodeURIComponent(userID)}`)
            .build()
            .execute();
    }

    getMe(): Promise<AxiosResponse> {
        return WebApiRequestBuilder.make(this._credentials.accessToken)
            .withMethod(AxiosMethod.GET)
            .withPath(`/v1/me`)
            .build()
            .execute();
    }

    getUserPlaylists(userID: string, options?: object): Promise<AxiosResponse> {
        return WebApiRequestBuilder.make(this._credentials.accessToken)
            .withMethod(AxiosMethod.GET)
            .withPath(`/v1/users/${encodeURIComponent(userID)}/playlists`)
            .withQueryParameters(options)
            .build()
            .execute();
    }

    getMePlaylists(options?: object): Promise<AxiosResponse> {
        return WebApiRequestBuilder.make(this._credentials.accessToken)
            .withMethod(AxiosMethod.GET)
            .withPath(`/v1/me/playlists`)
            .withQueryParameters(options)
            .build()
            .execute();
    }

    getPlaylist(playlistID: string, options?: object): Promise<AxiosResponse> {
        return WebApiRequestBuilder.make(this._credentials.accessToken)
            .withMethod(AxiosMethod.GET)
            .withPath(`/v1/playlists/${playlistID}`)
            .withQueryParameters(options)
            .build()
            .execute();
    }

    getPlaylistTracks(playlistID: string, options?: object): Promise<AxiosResponse> {
        return WebApiRequestBuilder.make(this._credentials.accessToken)
            .withMethod(AxiosMethod.GET)
            .withPath(`/v1/playlists/${playlistID}/tracks`)
            .withQueryParameters(options)
            .build()
            .execute();
    }

    createPlaylist(userID: string, playlistName: string, options?: object): Promise<AxiosResponse> {
        return WebApiRequestBuilder.make(this._credentials.accessToken)
            .withMethod(AxiosMethod.POST)
            .withHeaders({'Content-Type': 'application/json'})
            .withPath(`/v1/users/${encodeURIComponent(userID)}/playlists`)
            .withQueryParameters(Object.assign(
                options,
                {
                    'name': playlistName,
                }))
            .build()
            .execute();
    }

    followPlaylist(playlistID: string, options?: object): Promise<AxiosResponse> {
        return WebApiRequestBuilder.make(this._credentials.accessToken)
            .withMethod(AxiosMethod.PUT)
            .withHeaders({'Content-Type': 'application/json'})
            .withPath(`/v1/playlists/${playlistID}/followers`)
            .withQueryParameters(options)
            .build()
            .execute();
    }

    unfollowPlaylist(playlistID: string): Promise<AxiosResponse> {
        return WebApiRequestBuilder.make(this._credentials.accessToken)
            .withMethod(AxiosMethod.DELETE)
            .withHeaders({'Content-Type': 'application/json'})
            .withPath(`/v1/playlists/${playlistID}/followers`)
            .build()
            .execute();
    }

    changePlaylistDetails(playlistID: string, options?: object): Promise<AxiosResponse> {
        return WebApiRequestBuilder.make(this._credentials.accessToken)
            .withMethod(AxiosMethod.PUT)
            .withHeaders({'Content-Type': 'application/json'})
            .withPath(`/v1/playlists/${playlistID}`)
            .withQueryParameters(options)
            .build()
            .execute();
    }

    uploadCustomPlaylistCoverImage(playlistID: string, base64URI?: string): Promise<AxiosResponse> {
        return WebApiRequestBuilder.make(this._credentials.accessToken)
            .withMethod(AxiosMethod.PUT)
            .withHeaders({'Content-Type': 'image/jpeg'})
            .withPath(`/v1/playlists/${playlistID}/images`)
            .withBodyParameters(base64URI)
            .build()
            .execute();
    }

    addTracksToPlaylist(playlistID: string, tracks: string[], options?: object): Promise<AxiosResponse> {
        return WebApiRequestBuilder.make(this._credentials.accessToken)
            .withMethod(AxiosMethod.POST)
            .withHeaders({'Content-Type': 'application/json'})
            .withPath(`/v1/playlists/${playlistID}/tracks`)
            .withQueryParameters(options)
            .withBodyParameters({
                'uris': tracks
            })
            .build()
            .execute();
    }

    removeTracksFromPlaylist(playlistID: string, tracks: string[], options?: object): Promise<AxiosResponse> {
        return WebApiRequestBuilder.make(this._credentials.accessToken)
            .withMethod(AxiosMethod.DELETE)
            .withHeaders({'Content-Type': 'application/json'})
            .withPath(`/v1/playlists/${playlistID}/tracks`)
            .withBodyParameters(
                Object.assign(options, {
                    'uris': tracks
                })
            )
            .build()
            .execute();
    }

    removeTracksFromPlaylistByPosition(playlistID: string, positions: number[], snapshot_id: string): Promise<AxiosResponse> {
        return WebApiRequestBuilder.make(this._credentials.accessToken)
            .withMethod(AxiosMethod.DELETE)
            .withHeaders({'Content-Type': 'application/json'})
            .withPath(`/v1/playlists/${playlistID}/tracks`)
            .withBodyParameters({
                'positions': positions,
                'snapshot_id': snapshot_id
            })
            .build()
            .execute();
    }

    replaceTracksInPlaylist(playlistID: string, uris: string[]): Promise<AxiosResponse> {
        return WebApiRequestBuilder.make(this._credentials.accessToken)
            .withMethod(AxiosMethod.PUT)
            .withHeaders({'Content-Type': 'application/json'})
            .withPath(`/v1/playlists/${playlistID}/tracks`)
            .withBodyParameters({
                'uris': uris,
            })
            .build()
            .execute();
    }

    reorderTracksInPlaylist(playlistID: string, rangeStart: number, insertBefore: number, options?: object): Promise<AxiosResponse> {
        return WebApiRequestBuilder.make(this._credentials.accessToken)
            .withMethod(AxiosMethod.PUT)
            .withHeaders({'Content-Type': 'application/json'})
            .withPath(`/v1/playlists/${playlistID}/tracks`)
            .withBodyParameters(
                Object.assign(
                    options,
                    {
                        'range_start': rangeStart,
                        'insert_before': insertBefore
                    }
                )
            )
            .build()
            .execute();
    }

    getAudioFeaturesForTrack(trackID: string): Promise<AxiosResponse> {
        return WebApiRequestBuilder.make(this._credentials.accessToken)
            .withMethod(AxiosMethod.GET)
            .withPath(`/v1/audio-features/${trackID}`)
            .build()
            .execute();
    }

    getAudioAnalysisForTrack(trackID: string): Promise<AxiosResponse> {
        return WebApiRequestBuilder.make(this._credentials.accessToken)
            .withMethod(AxiosMethod.GET)
            .withPath(`/v1/audio-analysis/${trackID}`)
            .build()
            .execute();
    }

    getAudioFeaturesForTracks(trackIDs: string[]): Promise<AxiosResponse> {
        return WebApiRequestBuilder.make(this._credentials.accessToken)
            .withMethod(AxiosMethod.GET)
            .withPath(`/v1/audio-features`)
            .withQueryParameters({
                'ids': trackIDs.join(',')
            })
            .build()
            .execute();
    }

    getRecommendations(options?: any): Promise<AxiosResponse> {
        let optionsOfTypeArray = ['seed_artists', 'seed_genres', 'seed_tracks'];
        let realOptions: any = {};
        for (let option in options) {
            if (options.hasOwnProperty(option)) {
                if (optionsOfTypeArray.indexOf(option) !== -1 && Object.prototype.toString.call(options[option]) === '[object Array]') {
                    realOptions[option] = options[option].join(',');
                } else {
                    realOptions[option] = options[option];
                }
            }
        }
        return WebApiRequestBuilder.make(this._credentials.accessToken)
            .withMethod(AxiosMethod.GET)
            .withPath(`/v1/recommendations`)
            .withQueryParameters(realOptions)
            .build()
            .execute();
    }

    getAvailableGenreSeeds(): Promise<AxiosResponse> {
        return WebApiRequestBuilder.make(this._credentials.accessToken)
            .withMethod(AxiosMethod.GET)
            .withPath(`/v1/recommendations/available-genre-seeds`)
            .build()
            .execute();
    }

    getMySavedTracks(options?: object): Promise<AxiosResponse> {
        return WebApiRequestBuilder.make(this._credentials.accessToken)
            .withMethod(AxiosMethod.GET)
            .withPath(`/v1/me/tracks`)
            .withQueryParameters(options)
            .build()
            .execute();
    }

    containsMySavedTracks(trackIDs: string[]): Promise<AxiosResponse> {
        return WebApiRequestBuilder.make(this._credentials.accessToken)
            .withMethod(AxiosMethod.GET)
            .withPath(`/v1/me/tracks`)
            .withQueryParameters({
                'ids': trackIDs.join(',')
            })
            .build()
            .execute();
    }

    removeFromMySavedTracks(trackIDs: string[]): Promise<AxiosResponse> {
        return WebApiRequestBuilder.make(this._credentials.accessToken)
            .withMethod(AxiosMethod.DELETE)
            .withPath(`/v1/me/tracks`)
            .withHeaders({'Content-Type': 'application/json'})
            .withQueryParameters({
                'ids': trackIDs
            })
            .build()
            .execute();
    }

    addToMySavedTracks(trackIDs: string[]): Promise<AxiosResponse> {
        return WebApiRequestBuilder.make(this._credentials.accessToken)
            .withMethod(AxiosMethod.PUT)
            .withPath(`/v1/me/tracks`)
            .withHeaders({'Content-Type': 'application/json'})
            .withQueryParameters({
                'ids': trackIDs
            })
            .build()
            .execute();
    }

    removeFromMySavedAlbums(albumIDs: string[]): Promise<AxiosResponse> {
        return WebApiRequestBuilder.make(this._credentials.accessToken)
            .withMethod(AxiosMethod.DELETE)
            .withPath(`/v1/me/albums`)
            .withHeaders({'Content-Type': 'application/json'})
            .withQueryParameters(albumIDs)
            .build()
            .execute();
    }

    addToMySavedAlbums(): Promise<AxiosResponse> {
        return WebApiRequestBuilder.make(this._credentials.accessToken)
            .withMethod(AxiosMethod.PUT)
            .withPath(`/v1/me/albums`)
            .withHeaders({'Content-Type': 'application/json'})
            .withQueryParameters(albumIDs)
            .build()
            .execute();
    }

    getMySavedAlbums(): Promise<AxiosResponse> {

    }

    containsMySavedAlbums(): Promise<AxiosResponse> {

    }

    getMyTopArtists(): Promise<AxiosResponse> {

    }

    getMyTopTracks(): Promise<AxiosResponse> {

    }

    getMyRecentlyPlayedTracks(): Promise<AxiosResponse> {

    }

    getMyDevices(): Promise<AxiosResponse> {

    }

    getMyCurrentPlayingTrack(): Promise<AxiosResponse> {

    }

    getMyCurrentPlaybackState(): Promise<AxiosResponse> {

    }

    transferMyPlayback(): Promise<AxiosResponse> {

    }

    play(): Promise<AxiosResponse> {

    }

    pause(): Promise<AxiosResponse> {

    }

    skipToPrevious(): Promise<AxiosResponse> {

    }

    skipToNext(): Promise<AxiosResponse> {

    }

    seek(): Promise<AxiosResponse> {

    }

    setRepeat(): Promise<AxiosResponse> {

    }

    setShuffle(): Promise<AxiosResponse> {

    }

    setVolume(): Promise<AxiosResponse> {

    }

    followUsers(): Promise<AxiosResponse> {

    }

    followArtists(): Promise<AxiosResponse> {

    }

    unfollowUsers(): Promise<AxiosResponse> {

    }

    unfollowArtists(): Promise<AxiosResponse> {

    }

    isFollowingUsers(): Promise<AxiosResponse> {

    }

    getFollowedArtists(): Promise<AxiosResponse> {

    }

    areFollowingPlaylist(): Promise<AxiosResponse> {

    }

    isFollowingArtists(): Promise<AxiosResponse> {

    }

    getNewReleases(): Promise<AxiosResponse> {

    }

    getFeaturedPlaylists(): Promise<AxiosResponse> {

    }

    getCategories(): Promise<AxiosResponse> {

    }

    getCategory(): Promise<AxiosResponse> {

    }

    getPlaylistForCategory(): Promise<AxiosResponse> {

    }

    createAuthorizeURL(scopes: string[], state: string, showDialog: boolean): string {
        return AuthenticationRequestBuilder.make()
            .withPath('/authorize')
            .withQueryParameters({
                'client_id': this._credentials.clientID,
                'response_type': 'code',
                'redirect_uri': this._credentials.redirectURI,
                'scope': scopes.join('%20'),
                'state': state,
                'show_dialog': showDialog
            })
            .build()
            .getURI();
    }

    clientCredentialsGrant(): Promise<AxiosResponse> {

    }

    authorizationCodeGrant(): Promise<AxiosResponse> {

    }

    refreshAuthToken(): Promise<AxiosResponse> {

    }
}

export default SpotifyApi;
