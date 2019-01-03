"use strict"

// libs
const {logger} = require('./components/logger')
const express = require('express')
const bodyParser = require('body-parser')
const helmet = require('helmet')
const DDoS = require('dddos')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)

const {UpNext} = require('./components/upnext')
const upnext = UpNext.getInstance()

const {cors} = require('./components/cors')
const {socket_connection_callback} = require('./components/socket')
const {
    app_post_authAdminCode,
    app_post_authCallback,
    app_post_authCode,
    app_post_leaveParty,
    app_post_newParty
} = require('./components/api_routes')

const PORT = 8888

try {
    // Setup server
    logger.info("Setup Server...")
    app.use(cors())
    app.use(new DDoS({maxWeight: 5, errorData: {"response": 429, "message": "slow down"}}).express())
    app.use(helmet())
    app.use(bodyParser.json({limit: '512mb'}))
    app.use(bodyParser.urlencoded({limit: '512mb', extended: true}))
    // Routes
    app.post('/party/new-party', app_post_newParty)
    app.post('/party/auth-code', app_post_authCode)
    app.post('/party/leave', app_post_leaveParty)
    app.post('/party/auth-code-admin', app_post_authAdminCode)
    app.get('/party/auth-callback', app_post_authCallback)
    app.set('port', PORT)
    logger.info("Server setup complete!")

    // Setup SocketIO
    logger.info("Setup SocketIO...")
    io.on('connection', socket_connection_callback)
    logger.info("Socketio setup complete")

    // Start event loop
    logger.info("Start Event Loop...")
    upnext.startGlobalEventLoop()
    logger.info("Event Loop started")

    // start listening
    logger.info(`Listening on port ${PORT}`)
    http.listen(PORT)
} catch (e) {
    console.error(e)
}
