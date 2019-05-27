"use strict"

import {userSort} from "./sorts";

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

    getAlbumData(partyID, albumID) {
        const party = db.getParty(partyID)
        return Spotify.getAlbum(party.token, albumID)
    }

    getArtistAlbums(partyID, artistID) {
        const party = db.getParty(partyID)
        return Spotify.getArtistAlbums(party.token, artistID)
    }

    getArtistData(partyID, artistID) {
        const party = db.getParty(partyID)
        return Spotify.getArtist(party.token, artistID)
    }

    getArtistTopTracks(partyID, artistID) {
        const party = db.getParty(partyID)
        return Spotify.getArtistTopTracks(party.token, artistID)
    }

    getPlaylistTracks(partyID, playlistID) {
        const party = db.getParty(partyID)
        return Spotify.getPlaylistTracks(party.token, playlistID)
    }

    getPlaylistData(partyID, playlistID) {
        const party = db.getParty(partyID)
        return Spotify.getPlaylist(party.token, playlistID)
    }

    addSongToArchive(partyID, songID) {
        const party = db.getParty(partyID)
        return Spotify.addTrackToPlaylist(party.token, party.playlistid, songID)
    }

    playSong(partyID, songID) {
        const party = db.getParty(partyID)
        return Spotify.playerPlaySong(party.token, songID)
    }

    nextSong(partyID) {
        const party = db.getParty(partyID)
        if (party.playlist.length !== 0) {
            let playlist = JSON.parse(JSON.stringify(party.playlist))
            playlist.splice(0, 1)
            playlist.sort(playlistSort)
            db.updateParty(partyID, {playlist: playlist})
            this.playSong(partyID, party.playlist[0].id).then(() => {
            })
        }
    }

    sortPlaylistFromPartyID(partyID) {
        const party = db.getParty(partyID)
        if (party) {
            let playlist = JSON.parse(JSON.stringify(party.playlist))
            playlist.sort(playlistSort)
            return playlist
        }
        return []
    }

    getPlaylist(partyID) {
        return {
            id: partyID,
            playlist: this.sortPlaylistFromPartyID(partyID)
        }
    }

    getLeaderboard(partyID) {
        let users = db.getParty(partyID).users
        users.sort(userSort)
        return {
            id: partyID,
            users: users
        }
    }

    voteToSkip(partyID, userID) {
        const party = db.getParty(partyID)
        let skipListID = null
        for (let i = 0; i < party.voteskiplist.length; i++) {
            if (party.voteskiplist[i] === userID) {
                skipListID = i
                break
            }
        }
        if (skipListID === null) {
            if (party.voteskiplist.length + 1 >= (party.users.length / 2)) {
                this.nextSong(partyID)
                db.updateParty(partyID, {voteskiplist: []})
            } else {
                let skipList = party.voteskiplist
                skipList.push(userID)
                db.updateParty(partyID, {voteskiplist: skipList})
            }
            return true
        } else {
            return false
        }
    }

    addSongToPlaylist(partyID, userID, songID) {
        return new Promise((resolve, reject) => {
            this.getTrackData(partyID, songID)
                .then((track) => {
                    const party = db.getParty(partyID)
                    let userAddedName = ''
                    party.users.forEach((user) => {
                        if (user.uuid === userID) {
                            userAddedName = user.nickname
                        }
                    })
                    let playlist = party.playlist
                    let trackObject = {
                        id: track.id,
                        name: track.name,
                        artist: track.artists[0].name,
                        artwork: track.album.images.find((element) => {
                            return element.height <= 64
                        }).url,
                        votes: 0,
                        added: {
                            uuid: userID,
                            name: userAddedName,
                            time: (new Date()).valueOf()
                        },
                        upvoters: [],
                        downvoters: []
                    }
                    let dupeCheck = false
                    for (let i = 0; i < playlist.length; i++) {
                        if (playlist[i].id === track.id) {
                            dupeCheck = true
                            break
                        }
                    }
                    if (!dupeCheck) {
                        this.addSongToArchive(partyID, track.id)
                        if (playlist.length === 0 && !party.playstate) {
                            this.playSong(partyID, track.id, () => {
                            })
                        } else {
                            playlist.push(trackObject)
                            playlist.sort(playlistSort)
                            db.updateParty(partyID, {playlist: playlist})
                        }
                        resolve()
                    } else {
                        reject()
                    }
                })
        })
    }

    upvoteSong(partyID, songID, userID) {
        const party = db.getParty(partyID)
        let playlist = party.playlist
        let swap = false
        let scoreUserID = null
        for (let i = 0; i < playlist.length; i++) {
            if (playlist[i].id === songID) {
                if (!playlist[i].upvoters.includes(userID)) {
                    if (playlist[i].downvoters.includes(userID)) {
                        playlist[i].downvoters = playlist[i].downvoters.filter(el => el !== userID)
                        playlist[i].votes++
                        swap = true
                    }
                    playlist[i].votes++
                    playlist[i].upvoters.push(userID)
                    scoreUserID = playlist[i].added.uuid
                }
            }
        }
        let users = party.users
        for (let i = 0; i < users.length; i++) {
            if (users[i].uuid === scoreUserID) {
                users[i].score += (swap ? 2 : 1)
            }
        }
        users.sort(userSort)
        playlist.sort(playlistSort)
        db.updateParty(partyID, {playlist: playlist, users: users})
    }

    downvoteSong(partyID, songID, userID) {
        const party = db.getParty(partyID)
        let playlist = party.playlist
        let swap = false
        let scoreUserID = null
        for (let i = 0; i < playlist.length; i++) {
            if (playlist[i].id === songID) {
                if (!playlist[i].downvoters.includes(userID)) {
                    if (playlist[i].upvoters.includes(userID)) {
                        playlist[i].upvoters = playlist[i].upvoters.filter(el => el !== userID)
                        playlist[i].votes--
                        swap = true
                    }
                    playlist[i].votes--
                    playlist[i].downvoters.push(userID)
                    scoreUserID = playlist[i].added.uuid
                }
            }
        }
        let users = party.users
        for (let i = 0; i < users.length; i++) {
            if (users[i].uuid === scoreUserID) {
                users[i].score -= (swap ? 2 : 1)
            }
        }
        users.sort(userSort)
        playlist.sort(playlistSort)
        db.updateParty(partyID, {playlist: playlist, users: users})
    }

    fixChromeCastBug(partyID) {
        const party = db.getParty(partyID)
        this.playSong(partyID, party.currenttrack, () => {
        })
    }

    getColours(partyID) {
        let party = db.getParty(partyID)
        return {
            progress: party.backgroundcolour,
            back: party.progresscolour
        }
    }

    getAdminData() {
        const allParties = db.getAllParties()
        return allParties.map(e => ({
            id: e._id,
            name: e.name,
            code: e.code,
            queue: e.playlist.length,
            user: e.users.length,
            skip: e.voteskiplist.length,
            start: e.start
        }))
    }

    getParties() {
        return db.getAllParties()
    }

    deleteParty(partyID) {
        return db.deleteParty(partyID)
    }

    getPartyData(partyID) {
        return db.getParty(partyID)
    }
}

module.exports = {
    UpNext
}
