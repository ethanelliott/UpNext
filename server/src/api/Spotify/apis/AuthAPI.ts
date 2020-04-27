import { HttpMethods } from "../Types/HttpMethods";
import { plainToClass } from "class-transformer";
import RequestBuilder from "../Requests/RequestBuilder";
import AuthResponse from "../Types/AuthResponse";
import querystring from 'querystring';


export default class AuthAPI {

    public static SCOPES = {
        UGC_IMAGE_UPLOAD: 'ugc-image-upload',
        USER_READ_PLAYBACK_STATE: 'user-read-playback-state',
        USER_MODIFY_PLAYBACK_STATE: 'user-modify-playback-state',
        USER_READ_CURRENTLY_PLAYING: 'user-read-currently-playing',
        STREAMING: 'streaming',
        APP_REMOTE_CONTROL: 'app-remote-control',
        USER_READ_EMAIL: 'user-read-email',
        USER_READ_PRIVATE: 'user-read-private',
        PLAYLIST_READ_COLLABORATIVE: 'playlist-read-collaborative',
        PLAYLIST_MODIFY_PUBLIC: 'playlist-modify-public',
        PLAYLIST_READ_PRIVATE: 'playlist-read-private',
        PLAYLIST_MODIFY_PRIVATE: 'playlist-modify-private',
        USER_LIBRARY_MODIFY: 'user-library-modify',
        USER_LIBRARY_READ: 'user-library-read',
        USER_TOP_READ: 'user-top-read',
        USER_READ_PLAYBACK_POSITION: 'user-read-playback-position',
        USER_READ_RECENTLY_PLAYED: 'user-read-recently-played',
        USER_FOLLOW_READ: 'user-follow-read',
        USER_FOLLOW_MODIFY: 'user-follow-modify'
    };

    public static ALL_SCOPES: string;

    constructor() {
        AuthAPI.ALL_SCOPES = Object.keys(AuthAPI.SCOPES).join(' ');
    }

    public getAuthStartURL(clientID: string, redirectURI: string, scope: string, state: string): string {
        return `https://accounts.spotify.com/authorize?${
            querystring.stringify({
                response_type: 'code',
                client_id: clientID,
                scope: scope,
                redirect_uri: redirectURI,
                state: state
            })
        }`;
    }

    public async authorizationCode(clientID: string, clientSecret: string, code: string, redirectURI: string): Promise<AuthResponse> {
        let d = await RequestBuilder
            .builder()
            .withHost("accounts.spotify.com")
            .withScheme("https")
            .withHeaders({
                'Authorization': `Basic ${Buffer.from(`${clientID}:${clientSecret}`).toString('base64')}`
            })
            .withMethod(HttpMethods.POST)
            .withPath(`/api/token`)
            .withQueryParameters({
                code,
                redirect_uri: redirectURI,
                grant_type: 'authorization_code'
            })
            .build()
            .execute();
        return plainToClass(AuthResponse, d);
    }

    public async refreshAuthToken(clientID: string, clientSecret: string, refreshToken: string): Promise<AuthResponse> {
        let d = await RequestBuilder
            .builder()
            .withHost("accounts.spotify.com")
            .withScheme("https")
            .withHeaders({
                'Authorization': `Basic ${Buffer.from(`${clientID}:${clientSecret}`).toString('base64')}`
            })
            .withMethod(HttpMethods.POST)
            .withPath(`/api/token`)
            .withQueryParameters({
                refresh_token: refreshToken,
                grant_type: 'refresh_token'
            })
            .build()
            .execute();
        return plainToClass(AuthResponse, d);
    }
}
