"use strict"

const {logger} = require('../general/logger')
const axios = require('axios')
const uuid = require('uuid/v4')

const {client_id, client_secret, base_uri_api, base_uri_main} = require('../creds')

const upnext = require('./upnext').UpNext.getInstance()
const db = require('../Database/database').Database.getInstance()

function generateCode() {
    let ALL = "abcdefghijklmnpqrstuvwxyz1234567890".toUpperCase();
    let s = "";
    for (let i = 0; i < 4; i++) {
        s += ALL[Math.floor(Math.random() * ALL.length)];
    }
    return s;
}

const addNewUser = (partyID, nickName) => {
    let partyUsers = db.getParty(partyID).users
    let userid = uuid()
    partyUsers.push({
        uuid: userid,
        nickname: nickName,
        score: 0
    })
    db.updateParty(partyID, {users: partyUsers})
    return userid
}

const app_post_newParty = (req, res) => {
    let pd = req.body
    let partyCode = ""
    do {
        partyCode = generateCode()
    } while (db.find({code: partyCode}).length !== 0)
    db.add({
        name: pd.name,
        code: partyCode,
        start: (new Date()).toISOString(),
        backgroundcolour: 'rgba(0,0,0,0)',
        progresscolour: 'primary',
        adminpassword: pd.password,
        token: null,
        refreshtoken: null,
        expiresat: null,
        userid: null,
        playlistid: null,
        playlist: [],
        currenttrack: null,
        playstate: false,
        users: [],
        voteskiplist: []
    })
    let party = db.find({code: partyCode})[0]
    return res.json({
        id: party._id,
        code: partyCode,
        name: pd.name,
        uuid: addNewUser(party._id, "admin")
    })
}

const app_post_authCode = (req, res) => {
    let pd = req.body
    let lookupRes = db.find({code: pd.partyCode})
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
    let testVal = db.getParty(pd.id)
    if (testVal === undefined) {
        return res.json({valid: true})
    }
    let users = testVal.users
    for (let i = 0; i < users.length; i++) {
        if (users[i].uuid === pd.uuid) {
            users.splice(i, 1)
            db.updateParty(pd.id, {users: users})
            return res.json({valid: true})
        }
    }
    return res.json({valid: false})
}

const app_post_authAdminCode = (req, res) => {
    let pd = req.body
    let lookupRes = db.find({code: pd.partyCode})
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
    let lookupRes = db.getParty(id)
    if (lookupRes.length === 0) {
        return res.redirect(base_uri_main)
    } else {
        let authOptions = {
            method: 'post',
            url: 'https://accounts.spotify.com/api/token',
            params: {
                code: code,
                redirect_uri: base_uri_api + "/party/auth-callback",
                grant_type: 'authorization_code'
            },
            headers: {
                'Authorization': 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64')
            }
        }
        axios(authOptions)
            .then((response) => {
                let authToken = response.data.access_token
                let refreshToken = response.data.refresh_token
                let tokenExpire = (new Date()).valueOf() + (1000 * response.data.expires_in)
                axios({
                    method: 'get',
                    url: 'https://api.spotify.com/v1/me',
                    headers: {
                        'Authorization': 'Bearer ' + authToken
                    }
                }).then((new_response) => {
                    let userID = new_response.data.id
                    if (db.getParty(id).playlistid === null) {
                        axios({
                            method: 'post',
                            url: 'https://api.spotify.com/v1/users/' + userID + '/playlists',
                            data: {
                                name: lookupRes.name + ' By UpNext 🎵',
                                description: lookupRes.name + " archive, brought to you by UpNext",
                                public: false,
                                collaborative: false
                            },
                            headers: {
                                'Authorization': 'Bearer ' + authToken
                            }
                        }).then((playlistResponse) => {
                            let playlistID = playlistResponse.data.id
                            db.updateParty(id, {
                                token: authToken,
                                refreshtoken: refreshToken,
                                expiresat: tokenExpire,
                                userid: userID,
                                playlistid: playlistID
                            })
                            upnext.startGlobalEventLoop()
                            return res.redirect(base_uri_main + '/m')
                        }).catch((error) => {
                            logger.error(error.stack)
                        })
                    } else {
                        return res.redirect(base_uri_main + '/m')
                    }
                }).catch((error) => {
                    logger.error(error.stack)
                })
            }).catch((error) => {
            logger.error(error.stack)
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
