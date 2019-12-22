import RequestBuilder from "./RequestBuilder";

export default class WebAPIRequestBuilder {
    private static DEFAULT_HOST: string = "api.spotify.com";
    private static DEFAULT_SCHEME: string = "https";

    constructor() {
    }

    public static make(token: string): RequestBuilder {
        return RequestBuilder
            .builder()
            .withHost(this.DEFAULT_HOST)
            .withScheme(this.DEFAULT_SCHEME)
            .withAuth(token);
    }

}
