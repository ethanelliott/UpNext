"use strict"
function generateCode() {
    let ALL = "abcdefghijklmnopqrstuvwxyz1234567890".toUpperCase();
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
    const redirect_uri = 'http://localhost:8888/party/auth-callback';

    const updatePlaylistInSpotify = (partyID, callback) => {
        let party = db.party.find({_id: partyID})[0]
        let playlist = party.playlist
        playlist.sort(scoreSort)
        let playlist_uri_list = []
        for (let i = 0; i < playlist.length; i++) {
            playlist_uri_list.push('spotify:track:' + playlist[i].id)
        }
        axios({
            method: 'PUT',
            url: 'https://api.spotify.com/v1/users/' + party.userid + '/playlists/' + party.playlistid + '/tracks',
            headers: {
                'Authorization': 'Bearer ' + party.token
            },
            data: {
                uris: playlist_uri_list
            },
        })
            .then(function(response) {
                callback(response)
            })
            .catch(function(error) {
                callback(error)
            })
    }

    const searchTracks = (partyID, searchTerms, callback) => {
        let party = db.party.find({_id: partyID})[0]
        axios({
            method: 'get',
            url: 'https://api.spotify.com/v1/search/?q=' + searchTerms + '&type=track',
            headers: {
                'Authorization': 'Bearer ' + party.token
            }
        })
            .then(function(response) {
                callback(response)
            })
            .catch(function(error) {
                console.error(error)
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
            .then(function(response) {
                callback(response)
            })
            .catch(function(error) {
                console.error(error)
            })
    }

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
            userid: null,
            playlistid: null,
            playlist: [],
            currenttrack: null
        })
        return res.json({
            id: db.party.find({code: partyCode})[0]._id
        })
    })

    app.post('/party/auth-code', (req, res) => {
        let pd = req.body
        let lookupRes = db.party.find({code: pd.partyCode})
        if (lookupRes.length === 0) {
            return res.json({
                valid: false,
                id: null
            })
        } else {
            return res.json({
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
            return res.redirect('http://localhost:8080/#/')
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
                .then(function(response) {
                    let authToken = response.data.access_token
                    axios({
                        method: 'get',
                        url: 'https://api.spotify.com/v1/me',
                        headers: {
                            'Authorization': 'Bearer ' + authToken
                        }
                    })
                        .then(function(new_response) {
                            let userID = new_response.data.id
                            if (db.party.find({_id: id})[0].playlistid === null) {
                                axios({
                                    method: 'post',
                                    url: 'https://api.spotify.com/v1/users/' + userID + '/playlists',
                                    data: {
                                        name: "UpNext",
                                        description: "UpNext playlist for UpNext App",
                                        public: false,
                                        collaborative: false
                                    },
                                    headers: {
                                        'Authorization': 'Bearer ' + authToken
                                    }
                                })
                                    .then(function(playlistResponse) {
                                        let playlistID = playlistResponse.data.id
                                        updatePlaylistInSpotify(id, function(r) {
                                            db.party.update({_id: id}, {token: authToken, userid: userID, playlistid: playlistID})
                                            return res.redirect('http://localhost:8080/#/main/home')
                                        })
                                    })
                                    .catch(function(error) {
                                        console.error(error)
                                    })
                            } else {
                                return res.redirect('http://localhost:8080/#/main/home')
                            }
                        })
                        .catch(function(error) {
                            console.error(error)
                        })
                })
                .catch(function(error) {
                    console.error(error)
                })
            }
        })

        io.on('connection', (client) => {
            console.log("CONNECTED:", client.id)
            client.on('start-player-loop', (data) => {
                let party = db.party.find({_id: data.id})[0]
                let authToken = party.token
                let thisEventLoopID = null
                for (let i = 0; i < currentPartyEventLoop.length; i++) {
                    if (currentPartyEventLoop[i].id === data.id) {
                        thisEventLoopID = i
                    }
                }
                if (thisEventLoopID === null) {
                    currentPartyEventLoop.push({
                        id: data.id,
                        eventLoop: setInterval(function() {
                            axios({
                                method: 'get',
                                url: 'https://api.spotify.com/v1/me/player',
                                headers: {
                                    'Authorization': 'Bearer ' + authToken
                                }
                            })
                                .then(function(response) {
                                    if (party.currenttrack === null || party.currenttrack !== response.data.item.id) {
                                        console.log('current: ', party.currenttrack, 'playing:', response.data.item.id)
                                        party.currenttrack = response.data.item.id
                                        let playlist = party.playlist
                                        let removeid = null
                                        for (let i = 0; i < playlist.length; i++) {
                                            if (playlist[i].id === party.currenttrack) {
                                                removeid = i
                                                break
                                            }
                                        }
                                        playlist.splice(removeid, 1)
                                        db.party.update({_id: data.id}, {playlist: playlist})
                                        updatePlaylistInSpotify(data.id, (r) => {})
                                    }
                                    let thisEventLoopDataID = null
                                    for (let i = 0; i < currentPartyEventLoopData.length; i++) {
                                        if (currentPartyEventLoopData[i].id === data.id) {
                                            thisEventLoopDataID = i
                                        }
                                    }
                                    if (thisEventLoopDataID !== null) {
                                        currentPartyEventLoopData.splice(thisEventLoopDataID, 1)
                                    }
                                    currentPartyEventLoopData.push({
                                        id: data.id,
                                        data: response.data
                                    })
                                })
                                .catch(function(error) {
                                    console.error(error)
                                })

                        }, 1000)
                    })
                }
                setInterval(function() {
                    let j
                    for (let i = 0; i < currentPartyEventLoopData.length; i++) {
                        if (currentPartyEventLoopData[i].id === data.id) {
                            j = i
                        }
                    }
                    client.emit('event-loop', currentPartyEventLoopData[j])
                }, 1000)
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
                getTrackData(data.partyid, data.track.id, function(response) {
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
                        playlist.push(trackObject)
                        db.party.update({_id: data.partyid}, {playlist: playlist})
                    } else {
                        // Duplicate!
                    }
                    updatePlaylistInSpotify(data.partyid, (r) => {})
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
                db.party.update({_id: data.partyid}, {playlist: playlist})
                updatePlaylistInSpotify(data.partyid, (r) => {})
            })
            client.on('playlist-downvote-song', (data) => {
                let party = db.party.find({_id: data.partyid})[0]
                let playlist = party.playlist
                for (let i = 0; i < playlist.length; i++) {
                    if (playlist[i].id === data.track) {
                        playlist[i].votes--
                    }
                }
                db.party.update({_id: data.partyid}, {playlist: playlist})
                updatePlaylistInSpotify(data.partyid, (r) => {})
            })
        })
        app.set('port', PORT)
        http.listen(PORT)
    } catch (e) {
        console.error(e)
    }


