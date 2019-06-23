import { PlaylistEntry } from "playlistEntry";
import { User } from "user";

export type Party = {
    name: string,
    code: string,
    start: number,
    backgroundColour: string,
    progressColour: string,
    adminPassword: string,
    token: string,
    refreshToken: string,
    tokenExpiry: number,
    userID: string,
    playlistID: string,
    playlist: PlaylistEntry[],
    currentTrack: string,
    playState: boolean,
    users: User[],
    voteSkipList: string[],
    history: string[]
}

// this.name = name
// this.code = partyCode
// this.start = (new Date()).toISOString()
// this.backgroundColour = 'rgba(0,0,0,0)'
// this.progresscolour = 'primary'
// this.adminpassword = password
// this.token = null
// this.refreshtoken = null
// this.expiresat = null
// this.userid = null
// this.playlistid = null
// this.playlist = []
// this.currenttrack = null
// this.playstate = false
// this.users = []
// this.voteskiplist = []
// this.history = []
