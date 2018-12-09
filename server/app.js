"use strict"

function generateCode() {
    let ALL = "abcdefghijklmnpqrstuvwxyz1234567890".toUpperCase();
    let s = "";
    for (let i = 0; i < 4; i++) {
        s += ALL[Math.floor(Math.random() * ALL.length)];
    }
    return s;
}

function scoreSort($a, $b) {
    return ($b.votes - $a.votes)
}

try {
    const PORT = 8888
    const express = require('express')
    const path = require("path")
    const bodyParser = require('body-parser')
    const helmet = require('helmet')
    const DDoS = require('dddos')
    const axios = require('axios')
    const app = express()
    const http = require('http').Server(app)
    const io = require('socket.io')(http)
    const homedir = require('os').homedir()
    const fs = require('fs')
    const storeDir = path.join(homedir, 'upnext')
    const dbDir = path.join(homedir, 'upnext', 'db')
    let db = require('diskdb')
    const {
        cors
    } = require('./components/cors')

    const DATABASE_TABLES = [
        'party'
    ]

    if (!fs.existsSync(storeDir)) {
        fs.mkdirSync(storeDir)
    }
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir)
    }
    db = db.connect(dbDir, DATABASE_TABLES)

    // Global Event loop containers
    let currentPartyEventLoop = []
    let currentPartyEventLoopData = []

    app.use(cors())
    app.use(new DDoS({
        maxWeight: 5,
        errorData: {
            "response": 429,
            "message": "slow down"
        }
    }).express())
    app.use(helmet())
    app.use(bodyParser.json({
        limit: '512mb'
    }))
    app.use(bodyParser.urlencoded({
        limit: '512mb',
        extended: true
    }))

    const client_id = 'dd8b5386683d47cc9d955a00c1a9c3f8';
    const client_secret = '8de6722b006047c7b2bbb9e1de194f24';
    const redirect_uri = 'http://api.upnext.ml/party/auth-callback';

    const searchTracks = (partyID, searchTerms, callback) => {
        let party = db.party.find({_id: partyID})[0]
        axios({
            method: 'get',
            url: 'https://api.spotify.com/v1/search/?q=' + searchTerms + '&type=track',
            headers: {
                'Authorization': 'Bearer ' + party.token
            }
        })
            .then(function (response) {
                callback(response)
            })
            .catch(function (error) {
                // console.error(error)
            })
    }

    const getTrackData = (partyID, trackID, callback) => {
        let party = db.party.find({_id: partyID})[0]
        axios({
            method: 'get',
            url: 'https://api.spotify.com/v1/tracks/' + trackID,
            headers: {
                'Authorization': 'Bearer ' + party.token
            }
        })
            .then(function (response) {
                callback(response)
            })
            .catch(function (error) {
                // console.error(error)
            })
    }

    const checkForValidToken = (partyID, expiresAt, refreshToken, callback) => {
        let now = (new Date()).valueOf()
        if (expiresAt - now <= 2000) {
            let authOptions = {
                method: 'post',
                url: 'https://accounts.spotify.com/api/token',
                params: {
                    refresh_token: refreshToken,
                    grant_type: 'refresh_token'
                },
                headers: {
                    'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
                }
            }
            axios(authOptions).then(function(response) {
                let authToken = response.data.access_token
                let tokenExpire = (new Date()).valueOf() + (1000 * response.data.expires_in)
                db.party.update({_id: partyID}, {
                    token: authToken,
                    expiresat: tokenExpire
                })
                callback()
            }).catch(function(error) {
                // console.error(error)
            })
        } else {
            callback()
        }
    }

    const addSongToArchive = (partyID, songID) => {
        let party = db.party.find({_id: partyID})[0]
        axios({
            method: 'post',
            url: 'https://api.spotify.com/v1/playlists/' + party.playlistid + '/tracks',
            headers: {
                'Authorization': 'Bearer ' + party.token
            },
            data: ["spotify:track:" + songID]
        })
    }

    const startGlobalEventLoop = () => {
        let allParties = db.party.find()
        for (let i = 0; i < allParties.length; i++) {
            let thisEventLoopID = null
            for (let j = 0; j < currentPartyEventLoop.length; j++) {
                if (currentPartyEventLoop[j].id === allParties[j].id) {
                    thisEventLoopID = j
                }
            }
            if (thisEventLoopID === null) {
                currentPartyEventLoop.push({
                    id: allParties[i]._id,
                    eventLoop: setInterval(function () {
                        checkForValidToken(allParties[i]._id, allParties[i].expiresat, allParties[i].refreshtoken, () => {
                            axios({
                                method: 'get',
                                url: 'https://api.spotify.com/v1/me/player',
                                headers: {
                                    'Authorization': 'Bearer ' + allParties[i].token
                                }
                            }).then(function (response) {
                                let track = response.data
                                let party = db.party.find({_id: allParties[i]._id})[0]
                                if (party.playstate !== track.is_playing) {
                                    db.party.update({_id: allParties[i]._id}, {playstate: track.is_playing})
                                }
                                if (party.currenttrack === null) {
                                    db.party.update({_id: allParties[i]._id}, {currenttrack: response.data.item.id})
                                    party = db.party.find({_id: allParties[i]._id})[0]
                                }
                                if (track.item.duration_ms - track.progress_ms <= 1000) {
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
                                                'Authorization': 'Bearer ' + party.token
                                            }
                                        }).then(function () {
                                            addSongToArchive(party._id, party.playlist[0].id)
                                            let playlist = party.playlist
                                            playlist.splice(0, 1)
                                            playlist.sort(scoreSort)
                                            db.party.update({_id: allParties[i]._id}, {playlist: playlist})
                                        })
                                    }
                                }
                                let thisEventLoopDataID = null
                                for (let k = 0; k < currentPartyEventLoopData.length; k++) {
                                    if (currentPartyEventLoopData[k].id === allParties[i]._id) {
                                        thisEventLoopDataID = k
                                    }
                                }
                                if (thisEventLoopDataID !== null) {
                                    currentPartyEventLoopData.splice(thisEventLoopDataID, 1)
                                }
                                currentPartyEventLoopData.push({
                                    id: allParties[i]._id,
                                    data: response.data
                                })
                            }).catch(function (error) {
                                console.error(error)
                            })
                        })
                    }, 1000)
                })
            }
        }
    }

    startGlobalEventLoop()

    app.post('/party/new-party', (req, res) => {
        let pd = req.body
        let partyCode = ""
        do {
            partyCode = generateCode()
        } while (db.party.find({code: partyCode}).length !== 0)
        db.party.save({
            name: pd.name,
            code: partyCode,
            token: null,
            refreshtoken: null,
            expiresat: null,
            userid: null,
            playlistid: null,
            playlist: [],
            currenttrack: null,
            playstate: false
        })
        return res.json({
            id: db.party.find({code: partyCode})[0]._id,
            code: partyCode,
            name: pd.name
        })
    })

    app.post('/party/auth-code', (req, res) => {
        let pd = req.body
        let lookupRes = db.party.find({code: pd.partyCode})
        if (lookupRes.length === 0) {
            return res.json({
                valid: false,
                id: null,
                name: null
            })
        } else {
            return res.json({
                name: lookupRes[0].name,
                valid: true,
                id: lookupRes[0]._id
            })
        }
    })

    app.get('/party/auth-callback', (req, res) => {
        let code = req.query.code || null
        let id = req.query.state || null
        let lookupRes = db.party.find({_id: id})
        if (lookupRes.length === 0) {
            return res.redirect('http://upnext.ml/#/')
        } else {
            let authOptions = {
                method: 'post',
                url: 'https://accounts.spotify.com/api/token',
                params: {
                    code: code,
                    redirect_uri: redirect_uri,
                    grant_type: 'authorization_code'
                },
                headers: {
                    'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
                }
            }
            axios(authOptions)
                .then(function (response) {
                    let authToken = response.data.access_token
                    let refreshToken = response.data.refresh_token
                    let tokenExpire = (new Date()).valueOf() + (1000 * response.data.expires_in)
                    axios({
                        method: 'get',
                        url: 'https://api.spotify.com/v1/me',
                        headers: {
                            'Authorization': 'Bearer ' + authToken
                        }
                    })
                        .then(function (new_response) {
                            let userID = new_response.data.id
                            if (db.party.find({_id: id})[0].playlistid === null) {
                                axios({
                                    method: 'post',
                                    url: 'https://api.spotify.com/v1/users/' + userID + '/playlists',
                                    data: {
                                        name: "UpNextArchive",
                                        description: "UpNext Archive of all songs played at: " + lookupRes[0].name,
                                        public: false,
                                        collaborative: false
                                    },
                                    headers: {
                                        'Authorization': 'Bearer ' + authToken
                                    }
                                })
                                    .then(function (playlistResponse) {
                                        let playlistID = playlistResponse.data.id
                                        db.party.update({_id: id}, {
                                            token: authToken,
                                            refreshtoken: refreshToken,
                                            expiresat: tokenExpire,
                                            userid: userID,
                                            playlistid: playlistID
                                        })
                                        startGlobalEventLoop()
                                        return res.redirect('http://upnext.ml/#/main/home')
                                    })
                                    .catch(function (error) {
                                        // console.error(error)
                                    })
                            } else {
                                return res.redirect('http://upnext.ml/#/main/home')
                            }
                        })
                        .catch(function (error) {
                            // console.error(error)
                        })
                })
                .catch(function (error) {
                    // console.error(error)
                })
        }
    })

    io.on('connection', (client) => {
        client.on('disconnect', () => {
            console.log('DISCONNECTED: ', client.id)
        })
        console.log("CONNECTED:", client.id)
        client.on('start-player-loop', (data) => {
            setInterval(function () {
                let j
                for (let i = 0; i < currentPartyEventLoopData.length; i++) {
                    if (currentPartyEventLoopData[i].id === data.id) {
                        j = i
                    }
                }
                client.emit('event-loop', currentPartyEventLoopData[j])
            }, 1000)
        })
        client.on('toggle-playback', (data) => {
            let authToken = db.party.find({_id: data.id})[0].token
            let url = ''
            if (data.playback) {
                url = 'https://api.spotify.com/v1/me/player/play'
            } else {
                url = 'https://api.spotify.com/v1/me/player/pause'
            }
            axios({
                method: 'put',
                url: url,
                headers: {
                    'Authorization': 'Bearer ' + authToken
                }
            })
        })
        client.on('next-song', (data) => {
            let party = db.party.find({_id: data.id})[0]
            if (party.playlist.length === 0) {
                client.emit('cannot-skip')
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
                        'Authorization': 'Bearer ' + party.token
                    }
                }).then(function () {
                    let playlist = party.playlist
                    playlist.splice(0, 1)
                    playlist.sort(scoreSort)
                    db.party.update({_id: data.id}, {playlist: playlist})
                })
            }
        })
        client.on('get-playlist', (data) => {
            let playlist = db.party.find({_id: data.id})[0].playlist
            playlist.sort(scoreSort)
            client.emit('give-playlist', {
                id: data.id,
                playlist: playlist
            })
        })
        client.on('search', (data) => {
            searchTracks(data.partyid, data.searchstring, function (response) {
                client.emit('give-search-results', response.data)
            })
        })
        client.on('playlist-add-song', (data) => {
            getTrackData(data.partyid, data.track.id, function (response) {
                let party = db.party.find({_id: data.partyid})[0]
                let playlist = party.playlist
                let track = response.data
                let trackObject = {
                    id: track.id,
                    name: track.name,
                    artist: track.artists[0].name,
                    artwork: track.album.images.find((element) => {
                        return element.height <= 64
                    }).url,
                    votes: 0
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
                        axios({
                            method: 'put',
                            url: 'https://api.spotify.com/v1/me/player/play',
                            data: {
                                uris: [
                                    "spotify:track:" + track.id
                                ]
                            },
                            headers: {
                                'Authorization': 'Bearer ' + party.token
                            }
                        })
                    } else {
                        playlist.push(trackObject)
                        playlist.sort(scoreSort)
                        db.party.update({_id: data.partyid}, {playlist: playlist})
                    }
                    client.emit('track-added-success')
                } else {
                    // Duplicate!
                    for (let i = 0; i < playlist.length; i++) {
                        if (playlist[i].id === track.id) {
                            playlist[i].votes++
                        }
                    }
                    playlist.sort(scoreSort)
                    db.party.update({_id: data.partyid}, {playlist: playlist})
                    client.emit('track-added-duplicate')
                }
            })
        })
        client.on('playlist-upvote-song', (data) => {
            let party = db.party.find({_id: data.partyid})[0]
            let playlist = party.playlist
            for (let i = 0; i < playlist.length; i++) {
                if (playlist[i].id === data.track) {
                    playlist[i].votes++
                }
            }
            playlist.sort(scoreSort)
            db.party.update({_id: data.partyid}, {playlist: playlist})
            // updatePlaylistInSpotify(data.partyid, (r) => {})
        })
        client.on('playlist-downvote-song', (data) => {
            let party = db.party.find({_id: data.partyid})[0]
            let playlist = party.playlist
            for (let i = 0; i < playlist.length; i++) {
                if (playlist[i].id === data.track) {
                    playlist[i].votes--
                }
            }
            playlist.sort(scoreSort)
            db.party.update({_id: data.partyid}, {playlist: playlist})
            // updatePlaylistInSpotify(data.partyid, (r) => {})
        })
    })
    app.set('port', PORT)
    http.listen(PORT)
} catch (e) {
    console.error(e)
}


