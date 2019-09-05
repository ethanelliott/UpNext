'use strict';

import SpotifyRequest from "./SpotifyRequest";
import { AxiosMethod } from "AxiosMethod";

class SpotifyRequestBuilder {
    constructor() {
    }

    private _method: AxiosMethod;

    get method(): AxiosMethod {
        return this._method;
    }

    private _host: string;

    get host(): string {
        return this._host;
    }

    private _scheme: string;

    get scheme(): string {
        return this._scheme;
    }

    private _queryParameters: object;

    get queryParameters(): any {
        return this._queryParameters;
    }

    private _bodyParameters: object;

    get bodyParameters(): any {
        return this._bodyParameters;
    }

    private _headers: object;

    get headers(): any {
        return this._headers;
    }

    private _path: string;

    get path(): string {
        return this._path;
    }

    static builder() {
        return new SpotifyRequestBuilder();
    }

    withMethod(method: AxiosMethod): SpotifyRequestBuilder {
        this._method = method;
        return this;
    }

    withHost(host: string): SpotifyRequestBuilder {
        this._host = host;
        return this;
    }

    withScheme(scheme: string): SpotifyRequestBuilder {
        this._scheme = scheme;
        return this;
    }

    withPath(path: string): SpotifyRequestBuilder {
        this._path = path;
        return this;
    }

    withQueryParameters(queryParameters: any): SpotifyRequestBuilder {
        this._queryParameters = queryParameters;
        return this;
    }

    withBodyParameters(bodyParameters: any): SpotifyRequestBuilder {
        this._bodyParameters = bodyParameters;
        return this;
    }

    withHeaders(headers: object): SpotifyRequestBuilder {
        this._headers = Object.assign(this._headers || {}, headers);
        return this;
    }

    withAuth(accessToken: string): SpotifyRequestBuilder {
        this.withHeaders({'Authorization': `Bearer ${accessToken}`});
        return this;
    }

    build(): SpotifyRequest {
        return new SpotifyRequest(this);
    }
}

export default SpotifyRequestBuilder;

