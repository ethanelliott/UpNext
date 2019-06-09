'use strict'

const {logger} = require('../general/logger')
const Vibrant = require('node-vibrant')
const {playlistSort, userSort} = require('./sorts')

const Spotify = require('../Spotify/spotifyAPI').SPOTIFY_API.getInstance()
const db = require('../Database/database').Database.getInstance()

let _instance = null
class UpNext {
    constructor() {
        this.currentPartyEventLoop = []
        this.currentPartyEventLoopData = []
    }

    static getInstance() {
        if (!!!_instance) {
            _instance = new UpNext()
        }
        return _instance
    }

    startPartyEventLoop() {
        let allParties = db.getAllParties()
        logger.info(`[UPNEXT] Starting Parties...`)
        logger.info(`[UPNEXT] Party Count: ${allParties.length}`)
        for (let i = 0; i < allParties.length; i++) {
            let thisEventLoopID = null
            for (let j = 0; j < this.currentPartyEventLoop.length; j++) {
                if (allParties[j] !== undefined) {
                    if (this.currentPartyEventLoop[j].id === allParties[j].id) {
                        thisEventLoopID = j
                    }
                }
            }
            if (thisEventLoopID === null) {
                let ref = this
                ref.currentPartyEventLoop.push({
                    id: allParties[i]._id,
                    eventLoop: setInterval(function () {
                        let party = db.getParty(allParties[i]._id)
                        if (party) {
                            ref.checkForValidToken(party._id, party.expiresat, party.refreshtoken, () => {
                                ref.getPlayerData(party._id).then((response) => {
                                    let track = response
                                    if (track.item === undefined) {
                                        return;
                                    }
                                    if (party.playstate !== track.is_playing) {
                                        db.updateParty(party._id, {playstate: track.is_playing})
                                        party = db.getParty(party._id)
                                    }
                                    if (track.item.id !== party.currenttrack || party.currenttrack === null) {
                                        db.updateParty(party._id, {currenttrack: track.item.id})
                                        party = db.getParty(party._id)
                                        ref.calculateColours(party._id, track.item.album.images[0].url)
                                    }
                                    if (track.item.duration_ms - track.progress_ms <= 2000) {
                                        if (party.playlist.length === 0) {
                                            // TODO: Something when the playlist is empty
                                            ref.getRecommendations(party._id, ref.getHistory(party._id)).then(res => {
                                                ref.playSong(party._id, res.tracks[0].id)
                                                ref.addSongToArchive(party._id, res.tracks[0].id)
                                            })
                                        } else {
                                            ref.nextSong(party._id)
                                        }
                                    }
                                    let thisEventLoopDataID = null
                                    for (let k = 0; k < ref.currentPartyEventLoopData.length; k++) {
                                        if (ref.currentPartyEventLoopData[k].id === party._id) {
                                            thisEventLoopDataID = k
                                        }
                                    }
                                    if (thisEventLoopDataID !== null) {
                                        ref.currentPartyEventLoopData.splice(thisEventLoopDataID, 1)
                                    }
                                    ref.currentPartyEventLoopData.push({
                                        id: party._id,
                                        data: response
                                    })
                                }).catch((error) => {
                                    logger.error(error.stack)
                                })
                            })
                        }
                    }, 1000)
                })
            }
        }
    }

    checkForValidToken(partyID, expiresAt, refreshToken, callback) {
        logger.debug(`[UPNEXT] Check Token Expiry`)
        let now = (new Date()).valueOf()
        if (expiresAt - now <= 60000 * 5) {
            Spotify.refreshAuthToken(refreshToken)
                .then((data) => {
                    db.updateParty(partyID, {
                        token: data.access_token,
                        expiresat: data.expires_at
                    })
                    callback()
                })
        } else {
            callback()
        }
    }

    getPlayerData(partyID) {
        logger.debug(`[UPNEXT] Player Data`)
        const party = db.getParty(partyID)
        return Spotify.getPlayerData(party.token)
    }

    searchTracks(partyID, searchTerms) {
        logger.debug(`[UPNEXT] Search Track`)
        const party = db.getParty(partyID)
        return Spotify.search(party.token, searchTerms)
    }

    getTrackData(partyID, trackID) {
        logger.debug(`[UPNEXT] Track Data`)
        const party = db.getParty(partyID)
        return Spotify.getTrack(party.token, trackID)
    }

    getAlbumData(partyID, albumID) {
        logger.debug(`[UPNEXT] Album Data`)
        const party = db.getParty(partyID)
        return Spotify.getAlbum(party.token, albumID)
    }

    getArtistAlbums(partyID, artistID) {
        logger.debug(`[UPNEXT] Artist Albums`)
        const party = db.getParty(partyID)
        return Spotify.getArtistAlbums(party.token, artistID)
    }

    getArtistData(partyID, artistID) {
        logger.debug(`[UPNEXT] Artist Data`)
        const party = db.getParty(partyID)
        return Spotify.getArtist(party.token, artistID)
    }

    getArtistTopTracks(partyID, artistID) {
        logger.debug(`[UPNEXT] Artist Top Tracks`)
        const party = db.getParty(partyID)
        return Spotify.getArtistTopTracks(party.token, artistID)
    }

    getPlaylistTracks(partyID, playlistID) {
        logger.debug(`[UPNEXT] Playlist Tracks`)
        const party = db.getParty(partyID)
        return Spotify.getPlaylistTracks(party.token, playlistID)
    }

    getPlaylistData(partyID, playlistID) {
        logger.debug(`[UPNEXT] Playlist Data`)
        const party = db.getParty(partyID)
        return Spotify.getPlaylist(party.token, playlistID)
    }

    addSongToArchive(partyID, songID) {
        logger.debug(`[UPNEXT] Add Song To Playlist`)
        const party = db.getParty(partyID)
        let history = party.history
        history.push(songID)
        db.updateParty(partyID, {history: history})
        return Spotify.addTrackToPlaylist(party.token, party.playlistid, songID)
    }

    playSong(partyID, songID) {
        logger.debug(`[UPNEXT] Play Song`)
        const party = db.getParty(partyID)
        return Spotify.playerPlaySong(party.token, songID)
    }

    nextSong(partyID) {
        logger.debug(`[UPNEXT] Next Song`)
        const party = db.getParty(partyID)
        if (party.playlist.length !== 0) {
            let playlist = JSON.parse(JSON.stringify(party.playlist))
            playlist.splice(0, 1)
            playlist.sort(playlistSort)
            db.updateParty(partyID, {playlist: playlist})
            this.addSongToArchive(partyID, party.playlist[0].id)
            this.playSong(partyID, party.playlist[0].id).then(() => {
            })
        }
    }

    sortPlaylistFromPartyID(partyID) {
        logger.debug(`[UPNEXT] Sort Playlist`)
        const party = db.getParty(partyID)
        if (party) {
            let playlist = JSON.parse(JSON.stringify(party.playlist))
            playlist.sort(playlistSort)
            return playlist
        }
        return []
    }

    getPlaylist(partyID) {
        logger.debug(`[UPNEXT] Get Queue`)
        return {
            id: partyID,
            playlist: this.sortPlaylistFromPartyID(partyID)
        }
    }

    getHistory(partyID) {
        logger.debug(`[UPNEXT] Get History`)
        const party = db.getParty(partyID)
        if (party) {
            return JSON.parse(JSON.stringify(party.history))
        }
        return []
    }

    getLeaderboard(partyID) {
        logger.debug(`[UPNEXT] Get Leaderboard`)
        let users = db.getParty(partyID).users
        users.sort(userSort)
        return {
            id: partyID,
            users: users
        }
    }

    voteToSkip(partyID, userID) {
        logger.debug(`[UPNEXT] Vote Skip`)
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
        logger.debug(`[UPNEXT] Add Song To Queue`)
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
                        if (playlist.length === 0 && !party.playstate) {
                            this.playSong(partyID, track.id)
                            this.addSongToArchive(partyID, track.id)
                        } else {
                            playlist.push(trackObject)
                            playlist.sort(playlistSort)
                            db.updateParty(partyID, {playlist: playlist})
                            this.upvoteSong(partyID, songID, userID)
                        }
                        resolve()
                    } else {
                        this.upvoteSong(partyID, songID, userID)
                        reject()
                    }
                })
        })
    }

    removeSongFromPlaylist(partyID, userID, songID) {
        logger.debug(`[UPNEXT] Remove Song From Queue`)
        return new Promise((resolve, reject) => {
            const party = db.getParty(partyID)
            let playlist = party.playlist.filter(e => e.id !== songID)
            db.updateParty(partyID, {playlist: playlist})
        })
    }

    upvoteSong(partyID, songID, userID) {
        logger.debug(`[UPNEXT] Upvote Song`)
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
        logger.debug(`[UPNEXT] Downvote Song`)
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
        logger.debug(`[UPNEXT] Fix Chromecast Bug`)
        const party = db.getParty(partyID)
        this.playSong(partyID, party.currenttrack)
    }

    getColours(partyID) {
        logger.debug(`[UPNEXT] Get Party Colours`)
        let party = db.getParty(partyID)
        return {
            progress: party.backgroundcolour,
            back: party.progresscolour
        }
    }

    calculateColours(partyID, url) {
        Vibrant.from(url).getPalette().then((palette) => {
            let backC = '', progC = ''
            if (palette && palette.Vibrant && palette.Muted) {
                progC = palette.Muted.getHex()
                backC = palette.Vibrant.getHex()
            } else {
                progC = 'white'
                backC = 'rgba(0,0,0,0)'
            }
            db.updateParty(partyID, {backgroundcolour: backC, progresscolour: progC})
        })
    }

    getAdminData() {
        logger.debug(`[UPNEXT] Get Admin Data`)
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
        logger.debug(`[UPNEXT] Get Parties`)
        return db.getAllParties()
    }

    deleteParty(partyID) {
        logger.debug(`[UPNEXT] Delete Party`)
        return db.deleteParty(partyID)
    }

    getPartyData(partyID) {
        logger.debug(`[UPNEXT] Get Party Data`)
        return db.getParty(partyID)
    }

    getRecommendations(partyID, seedTracks) {
        logger.debug(`[UPNEXT] Get Recommendations`)
        const party = db.getParty(partyID)
        return Spotify.getRecommendations(party.token, seedTracks)
    }
}

module.exports = {
    UpNext
}
