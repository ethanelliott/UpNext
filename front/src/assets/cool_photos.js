axios.get(`https://musicbrainz.org/ws/2/recording/?fmt=json&limit=10&query=isrc:${t.isrc}`).then(artist_id => {
    if (artist_id.data.recordings.length > 0) {
        let artistID = artist_id.data.recordings[0]["artist-credit"][0].artist.id
        axios.get(`https://webservice.fanart.tv/v3/music/${artistID}?api_key=a71da8227d775ecbfc7e50c9fc87ef37`).then(images => {
            if (images.data.artistbackground) {
                postMessage(images.data.artistbackground[Math.floor(Math.random() * images.data.artistbackground.length)].url)
            } else {
                axios.get(`https://musicbrainz.org/ws/2/recording/?fmt=json&limit=10&query=${t.artist}`).then(artist_id_name => {
                    if (artist_id_name.data.recordings.length > 0) {
                        let artistID = artist_id_name.data.recordings[0]["artist-credit"][0].artist.id
                        axios.get(`https://webservice.fanart.tv/v3/music/${artistID}?api_key=a71da8227d775ecbfc7e50c9fc87ef37 `).then(images_Artist => {
                            if (images_Artist.data.artistbackground) {
                                postMessage(images_Artist.data.artistbackground[Math.floor(Math.random() * images_Artist.data.artistbackground.length)].url)
                            }
                        }).catch(err => {
                            postMessage(null)
                        })
                    }
                }).catch(err => {
                    postMessage(null)
                })
            }
        }).catch(err => {
            postMessage(null)
        })
    }
}).catch(err => {
    postMessage(null)
})
