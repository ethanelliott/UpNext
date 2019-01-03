"use strict"
const PROD = true

const client_id = 'dd8b5386683d47cc9d955a00c1a9c3f8';
const client_secret = '8de6722b006047c7b2bbb9e1de194f24';
const redirect_uri = (PROD ? 'https://api.upnext.ml' : 'http://localhost:8888') + "/party/auth-callback";


module.exports = {
    PROD,
    client_id,
    client_secret,
    redirect_uri
}
