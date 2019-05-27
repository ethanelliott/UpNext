"use strict"

const {logger} = require('../general/logger')
const axios = require('axios/index')
const Vibrant = require('node-vibrant')
const {playlistSort} = require('./sorts')

const Spotify = require('../Spotify/spotifyAPI').SPOTIFY_API.getInstance()
const db = require('../Database/database').Database.getInstance()

let _instance = null
class UpNext {
    constructor() {

    }

    static getInstance() {
        if (!!!_instance) {
            _instance = new UpNext()
        }
        return _instance
    }

    checkForValidToken(partyID, expiresAt, refreshToken, callback) {
        let now = (new Date()).valueOf()
        if (expiresAt - now <= 60000 * 5) {
            Spotify.refreshAuthToken(refreshToken, (new_token, new_refresh_token, new_expires) => {
                db.updateParty(partyID, {
                    token: new_token,
                    expiresat: (new Date()).valueOf() + (1000 * new_expires)
                })
                callback(new_token)
            })
        } else {
            callback(db.getParty(partyID).token)
        }
    }

    startPartyEventLoop() {
        logger.debug(`Starting LOOP`)
    }

    // All these methods do things from the party ID...AND MUST RETURN PROMISES
    searchTracks(partyID, searchTerms) {
        const party = db.getParty(partyID)
        return Spotify.search(party.token, searchTerms)
    }

    getTrackData(partyID, trackID) {
        const party = db.getParty(partyID)
        return Spotify.getTrack(party.token, trackID)
    }

}

module.exports = {
    UpNext
}
