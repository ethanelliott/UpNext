'use strict';

import SpotifyRequestBuilder from "./SpotifyRequestBuilder";
import axios, { AxiosResponse } from 'axios';
import { AxiosMethod } from "AxiosMethod";

class SpotifyRequest {
    private method: AxiosMethod;
    private readonly host: string;
    private readonly scheme: string;
    private queryParameters: any;
    private bodyParameters: any;
    private headers: any;
    private path: string;

    constructor(requestBuilder: SpotifyRequestBuilder) {
        this.method = requestBuilder.method;
        this.host = requestBuilder.host;
        this.scheme = requestBuilder.scheme;
        this.queryParameters = requestBuilder.queryParameters;
        this.bodyParameters = requestBuilder.bodyParameters;
        this.headers = requestBuilder.headers;
        this.path = requestBuilder.path;
    }

    execute(): Promise<AxiosResponse> {
        let _self: SpotifyRequest = this;
        return axios({
            url: _self.path,
            baseURL: _self.getURI(),
            method: _self.method,
            headers: _self.headers,
            params: _self.queryParameters,
            data: _self.bodyParameters
        });
    }

    getURI(): string {
        return `${this.scheme}://${this.host}`;
    }
}

export default SpotifyRequest;
