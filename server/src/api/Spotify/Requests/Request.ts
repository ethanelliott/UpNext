import { HttpMethods } from "../Types/HttpMethods";
import RequestBuilder from "./RequestBuilder";
import axios, { AxiosResponse } from 'axios';

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
        let response: AxiosResponse = await axios({
            method: this.httpMethodString(),
            url: this.getURI(),
            headers: this.headers,
            params: this.queryParameters,
            data: this.bodyParameters
        });
        return response.data;
    }

    private getURI(): string {
        return `${this.scheme}://${this.host}${this.path}`;
    }

    private httpMethodString(): 'GET' | 'DELETE' | 'POST' | 'PUT' {
        switch (this.method) {
            case HttpMethods.DELETE:
                return "DELETE";
            case HttpMethods.GET:
                return "GET";
            case HttpMethods.POST:
                return "POST";
            case HttpMethods.PUT:
                return "PUT";
            default:
                return "GET";
        }
    }

}
