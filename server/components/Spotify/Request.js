'use strict'

class Request {
    constructor(builder) {
        this._method = builder.method
        this._host = builder.host;
        this._scheme = builder.scheme;
        this._path = builder.path;
        this._queryParameters = builder.queryParameters;
        this._bodyParameters = builder.bodyParameters;
        this._headers = builder.headers;
    }

    get method() {
        return this._method;
    }

    set method(value) {
        this._method = value;
    }

    get host() {
        return this._host;
    }

    set host(value) {
        this._host = value;
    }

    get scheme() {
        return this._scheme;
    }

    set scheme(value) {
        this._scheme = value;
    }

    get path() {
        return this._path;
    }

    set path(value) {
        this._path = value;
    }

    get queryParameters() {
        return this._queryParameters;
    }

    set queryParameters(value) {
        this._queryParameters = value;
    }

    get bodyParameters() {
        return this._bodyParameters;
    }

    set bodyParameters(value) {
        this._bodyParameters = value;
    }

    get headers() {
        return this._headers;
    }

    set headers(value) {
        this._headers = value;
    }

    getURI() {
        if (!this.scheme || !this.host) {
            throw new Error('Missing components necessary to construct URI')
        }
        let uri = this.scheme + '://' + this.host
        if (this.path) {
            uri += this.path
        }
        return uri
    }

    getURL() {
        let uri = this.getURI();
        if (this.queryParameters) {
            return uri + this.getQueryParameterString(this.queryParameters);
        } else {
            return uri;
        }
    }

    getQueryParameterString(queryParameters) {
        if (queryParameters) {
            return (
                '?' +
                Object.keys(queryParameters)
                    .filter(function (key) {
                        return queryParameters[key] !== undefined
                    })
                    .map(function (key) {
                        return key + '=' + queryParameters[key]
                    })
                    .join('&')
            )
        }
    }
}

module.exports = {
    Request
}
