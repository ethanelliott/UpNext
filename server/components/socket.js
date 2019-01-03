"use strict"
const {logger} = require('./logger')
const axios = require('axios')
const {playlistSort, userSort} = require('./sorts')
const {getParty, updateParty} = require('./utils')

const {UpNext} = require('./upnext')
const upnext = UpNext.getInstance()

const searchTracks = (partyID, searchTerms, callback) => {
    let party = getParty(partyID)
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
            // Just let this fail silently, we don't care if there is no search term
            // logger.error(error.response.data.error)
        })

}

const getTrackData = (partyID, trackID, callback) => {
    let party = getParty(partyID)
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
            logger.error(error)
        })
}

const addSongToArchive = (partyID, songID) => {
    let party = getParty(partyID)
    axios({
        method: 'post',
        url: 'https://api.spotify.com/v1/playlists/' + party.playlistid + '/tracks',
        headers: {
            'Authorization': 'Bearer ' + party.token
        },
        data: ["spotify:track:" + songID]
    })
}


const playSong = (partyID, songID, callback) => {
    axios({
        method: 'put',
        url: 'https://api.spotify.com/v1/me/player/play',
        data: {
            uris: [
                "spotify:track:" + songID
            ]
        },
        headers: {
            'Authorization': 'Bearer ' + getParty(partyID).token
        }
    }).then(() => {
        callback()
    })
}

const nextSong = partyID => {
    let party = getParty(partyID)
    if (party.playlist.length !== 0) {
        playSong(partyID, party.playlist[0].id, () => {
            let playlist = party.playlist
            playlist.splice(0, 1)
            playlist.sort(playlistSort)
            updateParty(partyID, {playlist: playlist})
        })
    }
}

const togglePlayback = (partyID, playback) => {
    let authToken = getParty(partyID).token
    axios({
        method: 'put',
        url: (playback ? 'https://api.spotify.com/v1/me/player/play' : 'https://api.spotify.com/v1/me/player/pause'),
        headers: {
            'Authorization': 'Bearer ' + authToken
        }
    })
}

const sortPlaylistFromPartyID = partyID => {
    let playlist = getParty(partyID).playlist
    playlist.sort(playlistSort)
    return playlist
}

const getPlaylist = partyID => {
    return {
        id: partyID,
        playlist: sortPlaylistFromPartyID(partyID)
    }
}

const voteToSkip = (partyID, userID) => {
    let party = getParty(partyID)
    let skipListID = null
    for (let i = 0; i < party.voteskiplist.length; i++) {
        if (party.voteskiplist[i] === userID) {
            skipListID = i
            break
        }
    }
    if (skipListID === null) {
        if (party.voteskiplist.length + 1 >= (party.users.length / 2)) {
            nextSong(partyID)
            updateParty(partyID, {voteskiplist: []})
        } else {
            let skipList = party.voteskiplist
            skipList.push(userID)
            updateParty(partyID, {voteskiplist: skipList})
        }
        return true
    } else {
        return false
    }
}

const getLeaderboard = partyID => {
    let users = getParty(partyID).users
    users.sort(userSort)
    return {
        id: partyID,
        users: users
    }
}

const addSongToPlaylist = (partyID, userID, songID, callbackSuccess, callbackDuplicate) => {
    getTrackData(partyID, songID, (response) => {
        let party = getParty(partyID)
        let userAddedName = ''
        party.users.forEach((user) => {
            if (user.uuid === userID) {
                userAddedName = user.nickname
            }
        })
        let playlist = party.playlist
        let track = response.data
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
            addSongToArchive(partyID, track.id)
            if (playlist.length === 0 && !party.playstate) {
                playSong(partyID, track.id, () => {
                })
            } else {
                playlist.push(trackObject)
                playlist.sort(playlistSort)
                updateParty(partyID, {playlist: playlist})
            }
            callbackSuccess()
        } else {
            callbackDuplicate()
        }
    })
}

const upvoteSong = (partyID, songID, userID) => {
    let party = getParty(partyID)
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
    updateParty(partyID, {playlist: playlist, users: users})
}

const downvoteSong = (partyID, songID, userID) => {
    let party = getParty(partyID)
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
    updateParty(partyID, {playlist: playlist, users: users})
}

const socket_connection_callback = (client) => {
    client.eventLoop = null
    client.on('disconnect', () => {
        // Forced garbage collection
        clearInterval(client.eventLoop)
    })
    client.on('start-player-loop', (data) => {
        client.eventLoop = setInterval(function () {
            let j
            for (let i = 0; i < upnext.currentPartyEventLoopData.length; i++) {
                if (upnext.currentPartyEventLoopData[i].id === data.id) {
                    j = i
                }
            }
            client.emit('event-loop', upnext.currentPartyEventLoopData[j])
        }, 1000)
    })
    client.on('toggle-playback', (data) => {
        togglePlayback(data.id, data.playback)
    })
    client.on('next-song', (data) => {
        nextSong(data.id)
    })
    client.on('get-playlist', (data) => {
        client.emit('give-playlist', getPlaylist(data.id))
    })
    client.on('vote-skip', (data) => {
        client.emit('vote-voted', {
            success: voteToSkip(data.id, data.uuid)
        })
    })
    client.on('get-leaderboard', (data) => {
        client.emit('give-leaderboard', getLeaderboard(data.id))
    })
    client.on('search', (data) => {
        searchTracks(data.partyid, data.searchstring, function (response) {
            client.emit('give-search-results', response.data)
        })
    })
    client.on('playlist-add-song', (data) => {
        addSongToPlaylist(data.partyid, data.uuid, data.track.id, () => {
            client.emit('track-added-success')
        }, () => {
            client.emit('track-added-duplicate')
        })
    })
    client.on('playlist-upvote-song', (data) => {
        upvoteSong(data.partyid, data.track, data.uuid)
    })
    client.on('playlist-downvote-song', (data) => {
        downvoteSong(data.partyid, data.track, data.uuid)
    })
}

module.exports = {
    socket_connection_callback
}
