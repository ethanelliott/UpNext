// All Spotify API Types

export interface AlbumObject {
    album_type: string;
    artists: Array<ArtistObject>;
    available_markets: Array<string>;
    copyrights: Array<CopyrightObject>;
    external_ids: ExternalIdObject;
    external_urls: ExternalUrlObject;
    genres: Array<string>;
    href: string;
    id: string;
    images: Array<ImageObject>;
    label: string;
    name: string;
    popularity: number;
    release_date: string;
    release_sate_precision: string;
    tracks: Array<SimplifiedTrackObject>;
    type: string;
    uri: string;
}

export interface ArtistObject {
    external_urls: ExternalUrlObject;
    followers: FollowersObject;
    genres: Array<string>;
    href: string;
    id: string;
    images: Array<ImageObject>;
    name: string;
    popularity: number;
    type: string;
    uri: string;
}

export interface AudioFeaturesObject {
    acousticness: number;
    analysis_url: string;
    danceability: number;
    duration_ms: number;
    energy: number;
    id: string;
    instrumentalness: number;
    key: number;
    liveness: number;
    loudness: number;
    mode: number;
    speechiness: number;
    tempo: number;
    time_signature: number;
    track_href: string;
    type: string;
    uri: string;
    valence: number;
}

export interface CategoryObject {
    href: string;
    icons: Array<ImageObject>;
    id: string;
    name: string;
}

export interface ContextObject {
    type: string;
    href: string;
    external_urls: ExternalUrlObject;
    uri: string;
}

export interface CopyrightObject {
    text: string;
    type: string;
}

export interface CurrentlyPlayingObject {
    context: ContextObject;
    string: number;
    progress_ms: number;
    is_playing: boolean;
    item: TrackObject;
    currently_playing_type: string;
}

export interface CursorObject {
    after: string;
}

export interface CursorPagingObject<T> {
    href: string;
    items: Array<T>;
    limit: number;
    next: string;
    cursors: CursorObject;
    total: number;
}

export interface DeviceObject {
    id: string;
    is_active: boolean;
    is_private_session: boolean;
    is_restricted: boolean;
    name: string;
    type: string;
    volume_percent: number;
}

export interface DevicesObject {
    devices: Array<DeviceObject>;
}

export interface ErrorObject {
    status: number;
    message: string;
}

export interface PlayerErrorObject {
    status: number;
    message: string;
    reason: string;
}

export interface ExternalIdObject {
    isrc: string;
    ean: string;
    upc: string;
}

export interface FollowersObject {
    href: string;
    total: number;
}

export interface ImageObject {
    height: number;
    url: string;
    width: number;
}

export interface PagingObject<T> {
    href: string;
    items: Array<T>;
    limit: number;
    next: string;
    offset: number;
    previous: string;
    total: number;
}

export interface PlayHistoryObject {
    track: SimplifiedTrackObject;
    played_at: string;
    context: ContextObject;
}

export interface PlaylistObject {
    collaborative: boolean;
    external_urls: ExternalUrlObject;
    href: string;
    id: string;
    images: Array<ImageObject>;
    name: string;
    owner: PublicUserObject;
    public: boolean;
    snapshot_id: string;
    tracks: Array<TrackObject>;
    type: string;
    uri: string;
}

export interface SmiplifiedPlaylistObject {
    collaborative: boolean;
    external_urls: ExternalUrlObject;
    href: string;
    id: string;
    images: Array<ImageObject>;
    name: string;
    owner: PublicUserObject;
    public: boolean;
    snapshot_id: string;
    tracks: Array<TrackObject>;
    type: string;
    uri: string;
}

export interface PlaylistTrackObject {
    added_at: string;
    added_by: PublicUserObject;
    is_local: boolean;
    track: TrackObject;
}

export interface PrivateUserObject {
    birthdate: string;
    country: string;
    display_name: string;
    email: string;
    external_urls: ExternalUrlObject;
    followers: FollowersObject;
    href: string;
    id: string;
    images: Array<ImageObject>;
    product: string;
    type: string;
    uri: string;
}

export interface PublicUserObject {
    display_name: string;
    external_urls: ExternalUrlObject;
    followers: FollowersObject;
    href: string;
    id: string;
    images: Array<ImageObject>;
    type: string;
    uri: string;
}

export interface RecommendationSeedObject {
    afterFilteringSize: number;
    afterRelinkingSize: number;
    href: string;
    id: string;
    initialPoolSize: number;
    type: string;
}

export interface RecommendationsResponseObject {
    seeds: Array<RecommendationSeedObject>;
    tracks: Array<SimplifiedTrackObject>;
}

export interface SavedAlbumObject {
    added_at: string;
    album: AlbumObject;
}

export interface SavedTrackObject {
    added_at: string;
    track: TrackObject;
}

export interface SimplifiedAlbumObject {
    album_group: string;
    album_type: string;
    artists: Array<SimplifiedArtistObject>;
    available_markets: Array<string>;
    external_urls: ExternalUrlObject;
    href: string;
    id: string;
    images: Array<ImageObject>;
    name: string;
    type: string;
    uri: string;
}

export interface SimplifiedArtistObject {
    external_urls: ExternalUrlObject;
    href: string;
    id: string;
    name: string;
    type: string;
    uri: string;
}

export interface SimplifiedTrackObject {
    artists: Array<SimplifiedArtistObject>;
    available_markets: Array<string>;
    disc_number: number;
    duration_ms: number;
    explicit: boolean;
    external_urls: ExternalUrlObject;
    href: string;
    id: string;
    is_playable: string;
    linked_from: TrackLink;
    restrictions: any;
    name: string;
    preview_url: string;
    track_number: number;
    type: string;
    uri: string
}

export interface TrackObject {
    album: SimplifiedAlbumObject;
    artists: Array<ArtistObject>;
    available_markets: Array<string>;
    disc_number: number;
    duration_ms: number;
    explicit: boolean;
    external_ids: ExternalIdObject;
    external_urls: ExternalUrlObject;
    href: string;
    id: string;
    is_playable: boolean;
    linked_from: TrackObject;
    restrictions: any;
    name: string;
    popularity: number;
    preview_url: string;
    track_number: number;
    type: string;
    uri: string;
}

export interface TrackLink {
    external_urls: ExternalUrlObject;
    href: string;
    id: string;
    type: string;
    uri: string;
}

export interface TuneableTrackObject {
    acousticness: number;
    danceability: number;
    duration_ms: number;
    energy: number;
    instrumentalness: number;
    key: number;
    liveness: number;
    loudness: number;
    mode: number;
    popularity: number;
    speechiness: number;
    tempo: number;
    time_signature: number;
    valence: number;
}

export interface ExternalUrlObject {

}
