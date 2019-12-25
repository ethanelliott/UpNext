import { HttpMethods } from "../Types/HttpMethods";
import Request from "./Request";

export default class RequestBuilder {
    method: HttpMethods;
    host: string = "";
    scheme: string = "";
    path: string = "";
    headers: object = null;
    queryParameters: object = null;
    bodyParameters: object = null;

    private constructor() {
        this.headers = null;
        this.queryParameters = null;
        this.bodyParameters = null;
    }

    public static builder(): RequestBuilder {
        return new RequestBuilder();
    }

    public withMethod(method: HttpMethods): RequestBuilder {
        this.method = method;
        return this;
    }

    public withHost(host: string): RequestBuilder {
        this.host = host;
        return this;
    }

    public withScheme(scheme: string): RequestBuilder {
        this.scheme = scheme;
        return this;
    }

    public withPath(path: string): RequestBuilder {
        this.path = path;
        return this;
    }

    public withQueryParameters(queryParameters: object): RequestBuilder {
        this.queryParameters = queryParameters;
        return this;
    }

    public withBodyParameters(bodyParameters: object): RequestBuilder {
        this.bodyParameters = bodyParameters;
        return this;
    }

    public withHeaders(headers: object): RequestBuilder {
        this.headers = headers;
        return this;
    }

    public withAuth(token: string): RequestBuilder {
        if (!this.headers) {
            this.headers = {};
        }
        this.headers['Authorization'] = `Bearer ${token}`;
        return this;
    }

    public build(): Request {
        return new Request(this);
    }
}
