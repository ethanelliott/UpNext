"use strict"
const PORT = 8888

// libs
const {logger} = require('./components/general/logger')
const express = require('express')
const bodyParser = require('body-parser')
const helmet = require('helmet')
const DDoS = require('dddos')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)

const index = require('./routes/index')
const upnext = require('./components/UpNext/upnext').UpNext.getInstance()
const {cors} = require('./components/general/cors')
const {socket_connection_callback} = require('./components/UpNext/socket')

try {
    const profiler = logger.startTimer()
    logger.info("[SERVER] Setup Server...")
    app.use(cors())
    app.use(new DDoS({maxWeight: 5, errorData: {"response": 429, "message": "slow down"}}).express())
    app.use(helmet())
    app.use(bodyParser.json({limit: '512mb'}))
    app.use(bodyParser.urlencoded({limit: '512mb', extended: true}))
    app.use('/', index)
    app.set('port', PORT)
    logger.info("[SERVER] Server setup complete!")

    logger.info("[SOCKET] Setup SocketIO...")
    io.on('connection', socket_connection_callback)
    logger.info("[SOCKET] Socketio setup complete")

    upnext.startPartyEventLoop()

    logger.info(`[SERVER] Listening on port ${PORT}`)
    http.listen(PORT)
    logger.info(`[SERVER] Server setup complete`)
    profiler.done({message: `[SERVER] Startup`})
} catch (e) {
    logger.error(e.stack)
}
