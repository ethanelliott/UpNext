export default class AuthResponse {
    public access_token: string;
    public refresh_token: string;
    public expires_in: number;
    public token_type: string;
    public scope: string;

    public constructor() {
    }
}
