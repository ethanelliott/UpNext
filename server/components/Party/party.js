'use strict'

class Party {
    constructor(partyCode, name, password) {
        this.name = name
        this.code = partyCode
        this.start = (new Date()).toISOString()
        this.backgroundcolour = 'rgba(0,0,0,0)'
        this.progresscolour = 'primary'
        this.adminpassword = password
        this.token = null
        this.refreshtoken = null
        this.expiresat = null
        this.userid = null
        this.playlistid = null
        this.playlist = []
        this.currenttrack = null
        this.playstate = false
        this.users = []
        this.voteskiplist = []
        this.history = []
    }
}

module.exports = {
    Party
}
