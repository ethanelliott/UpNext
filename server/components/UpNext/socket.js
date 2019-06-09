'use strict'

const upnext = require('./upnext').UpNext.getInstance()

const socket_connection_callback = (client) => {
    client.eventLoop = null
    client.on('disconnect', () => {
        // Forced garbage collection
        clearInterval(client.eventLoop)
    })
    client.on('get-admin-data', () => {
        client.emit('got-admin-data', {data: upnext.getAdminData()})
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
    client.on('admin-fix-cast', (partyID) => {
        upnext.fixChromeCastBug(partyID)
    })
    client.on('admin-delete-party', (partyID) => {
        upnext.deleteParty(partyID)
    })
    client.on('get-colours', (partyID) => {
        client.emit('got-colours', upnext.getColours(partyID))
    })
    client.on('next-song', (data) => {
        upnext.nextSong(data.id)
    })
    client.on('get-parties', () => {
        client.emit('give-parties', upnext.getParties())
    })
    client.on('get-party-data', (data) => {
        client.emit('give-party-data', upnext.getPartyData(data.id))
    })
    client.on('get-playlist', (data) => {
        client.emit('give-playlist', upnext.getPlaylist(data.id))
    })
    client.on('vote-skip', (data) => {
        client.emit('vote-voted', {
            success: upnext.voteToSkip(data.id, data.uuid)
        })
    })
    client.on('get-leaderboard', (data) => {
        client.emit('give-leaderboard', upnext.getLeaderboard(data.id))
    })
    client.on('search', (data) => {
        upnext.searchTracks(data.partyid, data.searchstring).then((response) => {
            client.emit('give-search-results', response)
        })
    })
    client.on('playlist-add-song', (data) => {
        upnext.addSongToPlaylist(data.partyid, data.uuid, data.track.id).then(() => {
            client.emit('track-added-success')
        }, () => {
            client.emit('track-added-duplicate')
        })
    })
    client.on('playlist-undo-add-song', (data) => {
        upnext.removeSongFromPlaylist(data.partyid, data.uuid, data.track.id).then(() => {
            client.emit('track-undo-add-success')
        })
    })
    client.on('playlist-upvote-song', (data) => {
        upnext.upvoteSong(data.partyid, data.track, data.uuid)
    })
    client.on('playlist-downvote-song', (data) => {
        upnext.downvoteSong(data.partyid, data.track, data.uuid)
    })
    client.on('get-album-data', (data) => {
        upnext.getAlbumData(data.partyid, data.album).then((response) => {
            client.emit('got-album-data', response)
        })
    })
    client.on('get-recommendations', (data) => {
        //Get Seed tracks
        upnext.getRecommendations(data.partyid, upnext.getHistory(data.partyid)).then((response) => {
            client.emit('got-recommendations', response)
        })
    })
    client.on('get-artist-data', (data) => {
        Promise.all([
            upnext.getArtistData(data.partyid, data.artist),
            upnext.getArtistAlbums(data.partyid, data.artist),
            upnext.getArtistTopTracks(data.partyid, data.artist)
        ]).then(([general_data, albums_data, top_tracks_data]) => {
            client.emit('got-artist-data', {
                general: general_data,
                top_tracks: top_tracks_data,
                albums: albums_data
            })
        })
    })
    client.on('get-playlist-data', (data) => {
        Promise.all([
            upnext.getPlaylistData(data.partyid, data.playlist),
            upnext.getPlaylistTracks(data.partyid, data.playlist)
        ]).then(([general_data, track_data]) => {
            client.emit('got-playlist-data', {
                general: general_data,
                tracks: track_data
            })
        })
    })
}

module.exports = {
    socket_connection_callback
}
