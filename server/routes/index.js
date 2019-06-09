'use strict'
const {
    app_post_authAdminCode,
    app_get_authCallback,
    app_post_authCode,
    app_post_leaveParty,
    app_post_newParty,
    app_get_testCode
} = require('../components/UpNext/api_routes')
const express = require('express')

let app = express.Router()

app.post('/party/new-party', app_post_newParty)
app.post('/party/auth-code', app_post_authCode)
app.post('/party/leave', app_post_leaveParty)
app.post('/party/auth-code-admin', app_post_authAdminCode)
app.get('/party/auth-callback', app_get_authCallback)
app.get('/party/test/:id', app_get_testCode)

module.exports = app

