"use strict"
const {
    app_post_authAdminCode,
    app_post_authCallback,
    app_post_authCode,
    app_post_leaveParty,
    app_post_newParty,
    app_post_adminLogin
} = require('../components/api_routes')
const express = require('express')

let app = express.Router()

app.post('/party/new-party', app_post_newParty)
app.post('/party/auth-code', app_post_authCode)
app.post('/party/leave', app_post_leaveParty)
app.post('/party/auth-code-admin', app_post_authAdminCode)
app.get('/party/auth-callback', app_post_authCallback)
app.post('/party/auth-admin-login', app_post_adminLogin)

module.exports = app

