"use strict"

const {logger} = require('./logger')
const axios = require('axios')
const uuid = require('uuid/v4')

const {PROD, client_id, client_secret, redirect_uri} = require('./creds')

const {UpNext} = require('./upnext')
const upnext = UpNext.getInstance()

const {Database} = require('./database')
const db = Database.getInstance().getDatabase()

function generateCode() {
    let ALL = "abcdefghijklmnpqrstuvwxyz1234567890".toUpperCase();
    let s = "";
    for (let i = 0; i < 4; i++) {
        s += ALL[Math.floor(Math.random() * ALL.length)];
    }
    return s;
}

const addNewUser = (partyID, nickName) => {
    let partyUsers = db.party.find({_id: partyID})[0].users
    let userid = uuid()
    partyUsers.push({
        uuid: userid,
        nickname: nickName,
        score: 0
    })
    db.party.update({_id: partyID}, {users: partyUsers})
    return userid
}

const app_post_newParty = (req, res) => {
    let pd = req.body
    let partyCode = ""
    do {
        partyCode = generateCode()
    } while (db.party.find({code: partyCode}).length !== 0)
    db.party.save({
        name: pd.name,
        code: partyCode,
        adminpassword: pd.password,
        token: null,
        refreshtoken: null,
        expiresat: null,
        userid: null,
        playlistid: null,
        playlist: [],
        currenttrack: null,
        playstate: false,
        // User Tracking!
        users: [], // {uuid: "", nickname: "", score: 0, }
        voteskiplist: []
    })
    let party = db.party.find({code: partyCode})[0]
    return res.json({
        id: party._id,
        code: partyCode,
        name: pd.name,
        uuid: addNewUser(party._id, "admin")
    })
}

const app_post_authCode = (req, res) => {
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
            id: lookupRes[0]._id,
            uuid: addNewUser(lookupRes[0]._id, pd.nickName)
        })
    }
}

const app_post_leaveParty = (req, res) => {
    let pd = req.body
    let testVal = db.party.find({_id: pd.id})[0]
    if (testVal === undefined) {
        // Allow someone still in a deleted party to leave
        return res.json({valid: true})
    }
    let users = testVal.users
    for (let i = 0; i < users.length; i++) {
        if (users[i].uuid === pd.uuid) {
            users.splice(i, 1)
            db.party.update({_id: pd.id}, {users: users})
            return res.json({valid: true})
        }
    }
    return res.json({valid: false})
}

const app_post_authAdminCode = (req, res) => {
    let pd = req.body
    let lookupRes = db.party.find({code: pd.partyCode})
    if (lookupRes.length === 0) {
        return res.json({
            valid: false,
            id: null,
            name: null
        })
    } else {
        if (lookupRes[0].adminpassword === pd.partyPassword) {
            return res.json({
                name: lookupRes[0].name,
                valid: true,
                id: lookupRes[0]._id,
                uuid: addNewUser(lookupRes[0]._id, "admin")
            })
        } else {
            return res.json({
                valid: false,
                id: null,
                name: null
            })
        }
    }
}

const app_post_authCallback = (req, res) => {
    let code = req.query.code || null
    let id = req.query.state || null
    let lookupRes = db.party.find({_id: id})
    if (lookupRes.length === 0) {
        return res.redirect((PROD ? 'https://upnext.ml/#/' : 'http://localhost:8080/#/'))
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
                'Authorization': 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64')
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
                                    name: lookupRes[0].name + ' By UpNext 🎵',
                                    description: lookupRes[0].name + " archive, brought to you by UpNext",
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
                                    upnext.startGlobalEventLoop()
                                    return res.redirect((PROD ? 'https://upnext.ml' : 'http://localhost:8080') + '/#/main/home')
                                })
                                .catch(function (error) {
                                    console.log("Error 3", error)
                                    logger.error(error)
                                })
                        } else {
                            return res.redirect((PROD ? 'https://upnext.ml' : 'http://localhost:8080') + '/#/main/home')
                        }
                    })
                    .catch(function (error) {
                        console.log("Error 2", error)
                        logger.error(error)
                    })
            })
            .catch(function (error) {
                console.log("Error 1", error)
                logger.error(error)
            })
    }
}

module.exports = {
    app_post_authCallback,
    app_post_authAdminCode,
    app_post_leaveParty,
    app_post_authCode,
    app_post_newParty
}
