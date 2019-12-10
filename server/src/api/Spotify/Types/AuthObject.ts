export default class AuthObject {
    public scope: string;
    public token_type: string;
    public expires_in: number;
    public refresh_token: string;
    public access_token: string;

    public constructor() {
    }
}
