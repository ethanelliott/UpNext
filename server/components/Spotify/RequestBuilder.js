'use strict'

const {Request} = require('./Request')

class RequestBuilder {
    constructor() {
        this.method = null
        this.host = null
        this.scheme = null
        this.path = null
        this.headers = null
        this.queryParam = null
        this.bodyParam = null
    }

    static builder(accessToken) {
        return new RequestBuilder(accessToken)
    }

    withMethod(method) {
        if (method) {
            this.method = method
        }
        return this
    }

    withHost(host) {
        if (host) {
            this.host = host
        }
        return this
    }

    withScheme(scheme) {
        if (scheme) {
            this.scheme = scheme
        }
        return this
    }

    withPath(path) {
        if (path) {
            this.path = path
        }
        return this
    }

    withQueryParameters(queryParam) {
        if (queryParam) {
            this.queryParam = queryParam
        }
        return this
    }

    withBodyParameters(bodyParam) {
        if (bodyParam) {
            this.bodyParam = bodyParam
        }
        return this
    }

    withHeaders(headers) {
        if (headers) {
            this.headers = headers
        }
        return this
    }

    withAuth(accessToken) {
        if (accessToken) {
            this.withHeaders({Authorization: 'Bearer ' + accessToken});
        }
        return this;
    }

    build() {
        return new Request(this)
    }
}

module.exports = {
    RequestBuilder
}
