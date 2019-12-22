import { HttpMethods } from "../Types/HttpMethods";
import RequestBuilder from "./RequestBuilder";
import axios, { AxiosResponse } from 'axios';
import GenericError from "../error/GenericError";

export default class Request {
    private readonly method: HttpMethods;
    private readonly host: string;
    private readonly scheme: string;
    private readonly path: string;
    private readonly headers: object;
    private readonly queryParameters: object;
    private readonly bodyParameters: object;

    constructor(builder: RequestBuilder) {
        this.method = builder.method;
        this.host = builder.host;
        this.scheme = builder.scheme;
        this.path = builder.path;
        this.headers = builder.headers;
        this.queryParameters = builder.queryParameters;
        this.bodyParameters = builder.bodyParameters;
    }

    public async execute(): Promise<string> {
        try {
            let d = await this.makeAxios();
            return d.data;
        } catch (e) {
            throw new GenericError(e.response.data.error.status, e.response.data.error.message, e.stack);
        }
    }

    private getURI(): string {
        return `${this.scheme}://${this.host}${this.path}`;
    }

    private makeAxios(): Promise<AxiosResponse> {
        switch (this.method) {
            case HttpMethods.DELETE:
                return axios.request({
                    method: 'delete',
                    url: this.getURI(),
                    headers: this.headers,
                    params: this.queryParameters
                });
            case HttpMethods.GET:
                return axios.request({
                    method: 'get',
                    url: this.getURI(),
                    headers: this.headers,
                    params: this.queryParameters
                });
            case HttpMethods.POST:
                if (this.bodyParameters) {
                    return axios.request({
                        method: 'post',
                        url: this.getURI(),
                        headers: this.headers,
                        params: this.queryParameters,
                        data: this.bodyParameters
                    });
                } else {
                    return axios.request({
                        method: 'post',
                        url: this.getURI(),
                        headers: this.headers,
                        params: this.queryParameters
                    });
                }

            case HttpMethods.PUT:
                return axios.request({
                    method: 'put',
                    url: this.getURI(),
                    headers: this.headers,
                    params: this.queryParameters,
                    data: this.bodyParameters
                });
        }
    }

}
