"use strict"

const {logger} = require('./logger')
const axios = require('axios')

const {playlistSort} = require('./sorts')
const {client_id, client_secret} = require('./creds')

const db = require('./database').Database.getInstance()

const checkForValidToken = (partyID, expiresAt, refreshToken, callback) => {
    let now = (new Date()).valueOf()
    if (expiresAt - now <= 60000 * 5) {
        let authOptions = {
            method: 'post',
            url: 'https://accounts.spotify.com/api/token',
            params: {
                refresh_token: refreshToken,
                grant_type: 'refresh_token'
            },
            headers: {
                'Authorization': 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64')
            }
        }
        axios(authOptions).then((response) => {
            let authToken = response.data.access_token
            let tokenExpire = (new Date()).valueOf() + (1000 * response.data.expires_in)
            db.updateParty(partyID, {
                token: authToken,
                expiresat: tokenExpire
            })
            callback(authToken)
        }).catch((error) => {
            callback(db.getParty(partyID).token)
            logger.error(error.stack)
        })
    } else {
        callback(db.getParty(partyID).token)
    }
}

class UpNext {
    constructor() {
        this._currentPartyEventLoop = []
        this._currentPartyEventLoopData = []
    }

    get currentPartyEventLoop() {
        return this._currentPartyEventLoop;
    }

    set currentPartyEventLoop(value) {
        this._currentPartyEventLoop = value;
    }

    get currentPartyEventLoopData() {
        return this._currentPartyEventLoopData;
    }

    set currentPartyEventLoopData(value) {
        this._currentPartyEventLoopData = value;
    }

    static getInstance() {
        if (!!!this.instance) {
            this.instance = new UpNext()
        }
        return this.instance
    }

    startGlobalEventLoop() {
        let allParties = db.getAllParties()
        logger.info(`Starting Parties...`)
        for (let i = 0; i < allParties.length; i++) {
            let thisEventLoopID = null
            for (let j = 0; j < this._currentPartyEventLoop.length; j++) {
                if (this._currentPartyEventLoop[j].id === allParties[j].id) {
                    thisEventLoopID = j
                }
            }
            if (thisEventLoopID === null) {
                let ref = this
                ref._currentPartyEventLoop.push({
                    id: allParties[i]._id,
                    eventLoop: setInterval(function () {
                        let party = db.getParty(allParties[i]._id)
                        checkForValidToken(party._id, party.expiresat, party.refreshtoken, (token) => {
                            axios({
                                method: 'get',
                                url: 'https://api.spotify.com/v1/me/player',
                                headers: {
                                    'Authorization': 'Bearer ' + token
                                }
                            }).then((response) => {
                                let track = response.data
                                if (track.item === undefined) {
                                    return;
                                }
                                if (party.playstate !== track.is_playing) {
                                    db.updateParty(party._id, {playstate: track.is_playing})
                                    party = db.getParty(party._id)
                                }
                                if (party.currenttrack === null) {
                                    db.updateParty(party._id, {currenttrack: response.data.item.id})
                                    party = db.getParty(party._id)
                                }
                                if (track.item.duration_ms - track.progress_ms <= 2000) {
                                    if (party.playlist.length === 0) {
                                        // No Next Song... Just wait
                                    } else {
                                        axios({
                                            method: 'put',
                                            url: 'https://api.spotify.com/v1/me/player/play',
                                            data: {
                                                uris: [
                                                    "spotify:track:" + party.playlist[0].id
                                                ]
                                            },
                                            headers: {
                                                'Authorization': 'Bearer ' + token
                                            }
                                        }).then(() => {
                                            let playlist = party.playlist
                                            playlist.splice(0, 1)
                                            playlist.sort(playlistSort)
                                            db.updateParty(party._id, {playlist: playlist, voteskiplist: []})
                                        }).catch((error) => {
                                            logger.error(error.stack)
                                        })
                                    }
                                }
                                let thisEventLoopDataID = null
                                for (let k = 0; k < ref._currentPartyEventLoopData.length; k++) {
                                    if (ref._currentPartyEventLoopData[k].id === party._id) {
                                        thisEventLoopDataID = k
                                    }
                                }
                                if (thisEventLoopDataID !== null) {
                                    ref._currentPartyEventLoopData.splice(thisEventLoopDataID, 1)
                                }
                                ref._currentPartyEventLoopData.push({
                                    id: party._id,
                                    data: response.data
                                })
                            }).catch((error) => {
                                logger.error(error)
                            })
                        })
                    }, 1000)
                })
            }
        }
    }
}

module.exports = {
    UpNext
}