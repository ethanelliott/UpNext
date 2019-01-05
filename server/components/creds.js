"use strict"
const PROD = false

const client_id = 'dd8b5386683d47cc9d955a00c1a9c3f8'
const client_secret = '8de6722b006047c7b2bbb9e1de194f24'
const base_uri_api = (PROD ? 'https://api.upnext.ml' : 'http://localhost:8888')
const base_uri_main = (PROD ? 'https://upnext.ml' : 'http://localhost:8080')


module.exports = {
    client_id,
    client_secret,
    base_uri_api,
    base_uri_main
}
