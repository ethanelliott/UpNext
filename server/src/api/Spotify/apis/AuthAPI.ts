import { HttpMethods } from "../Types/HttpMethods";
import { plainToClass } from "class-transformer";
import RequestBuilder from "../Requests/RequestBuilder";
import AuthResponse from "../Types/AuthResponse";
import querystring from 'querystring';


export default class AuthAPI {

    public static ALL_SCOPE = 'user-read-private user-read-email user-library-read user-library-modify playlist-read-private streaming app-remote-control user-modify-playback-state user-read-currently-playing user-read-playback-state playlist-modify-public playlist-modify-private';

    constructor() {
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

    public async authorizationCode(clientID: string, clientSecret: string, code: string, redirectURI: string,): Promise<AuthResponse> {
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
}
