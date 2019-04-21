<template>
    <v-container :style="backStyle" class="back-style" fill-height fluid>
        <v-layout align-center justify-center row v-if="loading">
            <v-flex class="text-xs-center">
                <v-progress-circular :size="200" :width="15" color="primary" indeterminate></v-progress-circular>
            </v-flex>
        </v-layout>
        <v-layout align-center justify-center row v-if="!loading" wrap>
            <v-container>
                <v-layout>
                    <v-flex lg8 md10 sm10 xs12>
                        <v-container>
                            <v-layout align-center justify-start>
                                <v-flex xs6>
                                    <img :src="albumArtwork" class="elevation-24 album-art-image"
                                         style="width:90%;max-width:500px;max-height: 500px;"/>
                                </v-flex>
                                <v-flex fill-height style="max-width: 500px">
                                    <p :style="textStyle" class="big-text">{{ trackName }}</p>
                                    <p class="headline font-weight-light">{{ artist }}</p>
                                </v-flex>
                            </v-layout>
                        </v-container>
                    </v-flex>
                    <v-flex lg4 md6 offset-xs1 sm6 xs8>
                        <v-container>
                            <v-layout justify-center>
                                <v-flex class="text-xs-center">
                                    <v-card class="elevation-24">
                                        <v-toolbar color="secondary" dark>
                                            <v-toolbar-title class="white--text">Leaderboard</v-toolbar-title>
                                            <v-spacer></v-spacer>
                                        </v-toolbar>
                                        <v-card-text>
                                            <template v-for="(user, index) in users">
                                                <v-list-tile :key="user.title" avatar>
                                                    <v-list-tile-avatar tile>
                                                        <v-btn flat icon>
                                                            <span>{{ index + 1 }}</span>
                                                        </v-btn>
                                                    </v-list-tile-avatar>
                                                    <v-list-tile-content>
                                                        <v-list-tile-title>{{ user.nickname }}</v-list-tile-title>
                                                    </v-list-tile-content>
                                                    <v-list-tile-action>
                                                        <v-btn flat icon>
                                                            <span>{{ user.score }}</span>
                                                        </v-btn>
                                                    </v-list-tile-action>
                                                </v-list-tile>
                                                <v-divider
                                                        :key="index"
                                                        v-if="index + 1 < users.length"
                                                ></v-divider>
                                            </template>
                                        </v-card-text>
                                    </v-card>
                                </v-flex>
                            </v-layout>
                        </v-container>
                    </v-flex>
                </v-layout>
            </v-container>
            <v-container class="pb-5">
                <v-layout>
                    <v-flex>
                        <v-container>
                            <v-layout column justify-start>
                                <v-flex>
                                    <div style="font-size: 1.5em">Up Next:</div>
                                </v-flex>
                                <v-flex>
                                    <template v-for="(track) in queue">
                                        <div class="queue-artwork-container ma-2 mr-5 pr-4 d-inline-block"
                                             v-bind:key="track.id">
                                            <img :src="track.artwork" class="elevation-24"
                                                 style="height: 128px; width:128px; filter: blur(2px) brightness(50%);position: absolute;">
                                            <div style="height: 128px; width:128px; position: relative; z-index: 2; top:0; bottom: 0; left: 0; right: 0;display: flex; justify-content: center;align-items: center;">
                                                <p style="font-size: 3em;margin: 0 0;">{{ track.votes }}</p>
                                            </div>
                                            <div style="max-width:128px; overflow-x: hidden; white-space: nowrap;margin-top:0.5em;">
                                                {{ track.name }}
                                            </div>
                                            <div style="max-width:128px; overflow-x: hidden; white-space: nowrap;">{{
                                                track.artist }}
                                            </div>
                                        </div>
                                    </template>
                                </v-flex>
                            </v-layout>
                        </v-container>
                    </v-flex>
                </v-layout>
            </v-container>
        </v-layout>
        <v-footer class="elevation-20" dark fixed height="auto">
            <v-container class="ma-0 pa-2" fluid>
                <v-layout align-center justify-center>
                    <v-flex>
                        <v-progress-linear :color="progressColour" class="my-0" height="10"
                                           v-model="trackPos"></v-progress-linear>
                    </v-flex>
                </v-layout>
            </v-container>
        </v-footer>
    </v-container>
</template>

<script>
    import io from 'socket.io-client'
    import axios from 'axios'
    import session from 'sessionstorage'
    import Jimp from 'jimp'
    import * as Vibrant from 'node-vibrant'

    export default {
        name: "PartyView",
        data: () => ({
            socket: null,
            loading: true,
            partyID: null,
            albumArtwork: null,
            trackName: null,
            artist: null,
            isrc: null,
            backStyle: '',
            textStyle: '',
            trackPos: 0,
            users: [],
            queue: [],
            previousTrack: '',
            progressColour: 'primary'
        }),
        beforeDestroy() {
            this.socket.disconnect()
            clearInterval(this.eventLoop)
            this.previousTrack = ''
        },
        mounted() {
            let t = this
            t.partyID = session.getItem('partyID')
            t.socket = io(this.$socketPath)
            t.socket.on('connect', () => {
                t.socket.emit('start-player-loop', {id: t.partyID})
                t.eventLoop = setInterval(function () {
                    t.socket.emit('get-leaderboard', {id: t.partyID})
                    t.socket.emit('get-playlist', {id: t.partyID})
                }, 500)
            })
            t.socket.on('give-leaderboard', (data) => {
                t.users = data.users.slice(0, 5)
            })
            t.socket.on('give-playlist', (data) => {
                t.queue = data.playlist.slice(0, 5)
            })
            t.socket.on('event-loop', (data) => {
                let d = data.data
                t.trackPos = (d.progress_ms / d.item.duration_ms) * 100
                t.albumArtwork = d.item.album.images[0].url
                t.trackName = d.item.name
                t.artist = d.item.artists.map(e => e.name).reduce((a, b) => {
                    return `${a}${b}, `
                }, ``).slice(0, -2)
                t.isrc = d.item.external_ids.isrc
                if (t.previousTrack !== t.trackName) {
                    t.previousTrack = t.trackName
                    Vibrant.from(t.albumArtwork).getPalette().then(function (palette) {
                        if (palette && (palette.DarkVibrant || palette.Vibrant)) {
                            t.backStyle = "background-image: linear-gradient(" + (palette.Vibrant ? palette.Vibrant.getHex() : palette.DarkVibrant.getHex()) + " 10%, rgba(0,0,0,1) 90%);'"
                            t.progressColour = (palette.Vibrant ? palette.Vibrant.getHex() : palette.DarkVibrant.getHex())
                        } else {
                            t.backStyle = "background-image: linear-gradient(rgba(0,0,0,0) 10%, rgba(0,0,0,1) 90%);'"
                            t.progressColour = 'white'
                        }
                        // I just run both promises at the same time, and the one that succeeds gets to change the image
                        axios.get(`https://musicbrainz.org/ws/2/recording/?fmt=json&limit=10&query=isrc:${t.isrc}`).then(artist_id => {
                            if (artist_id.data.recordings.length > 0) {
                                let artistID = artist_id.data.recordings[0]["artist-credit"][0].artist.id
                                axios.get(`https://webservice.fanart.tv/v3/music/${artistID}?api_key=a71da8227d775ecbfc7e50c9fc87ef37`).then(images => {
                                    if (images.data.artistbackground) {
                                        t.loadBackgroundImage(images.data.artistbackground[Math.floor(Math.random() * images.data.artistbackground.length)].url)
                                    } else {
                                        axios.get(`https://musicbrainz.org/ws/2/recording/?fmt=json&limit=10&query=${t.artist}`).then(artist_id_name => {
                                            if (artist_id_name.data.recordings.length > 0) {
                                                let artistID = artist_id_name.data.recordings[0]["artist-credit"][0].artist.id
                                                axios.get(`https://webservice.fanart.tv/v3/music/${artistID}?api_key=a71da8227d775ecbfc7e50c9fc87ef37 `).then(images_Artist => {
                                                    if (images_Artist.data.artistbackground) {
                                                        t.loadBackgroundImage(images_Artist.data.artistbackground[Math.floor(Math.random() * images_Artist.data.artistbackground.length)].url)
                                                    }
                                                }).catch(err => {
                                                })
                                            }
                                        }).catch(err => {
                                        })
                                    }
                                }).catch(err => {
                                })
                            }
                        }).catch(err => {
                        })
                    })
                }
                if (t.albumArtwork !== null) {
                    t.loading = false
                }
            })
        },
        methods: {
            loadBackgroundImage(imgURL) {
                let t = this
                let proxyURL = "https://cors-anywhere.herokuapp.com/"
                Jimp.read(proxyURL + imgURL)
                    .then(image => {
                        image.scale(1.2)
                        image.blur(10)
                        image.brightness(-0.8)
                        image.getBase64Async(Jimp.MIME_PNG).then(url => {
                            t.backStyle = `animation-play-state: running;background: url(${url});`
                        })
                            .catch(err => {
                                console.error(err)
                            })
                    })
                    .catch(err => console.error(err))
            }
        }
    }
</script>
<style>
    html {
        overflow-y: hidden;
    }
</style>
<style scoped>
    /* OOOUUUUU VERY RANDOM MOVEMENT*/
    @keyframes MOVE-BG {
        0% {
            background-position: left top;
        }
        25% {
            background-position: right bottom;
        }
        50% {
            background-position: center center;
        }
        75% {
            background-position: left bottom;
        }
        100% {
            background-position: left top;
        }
    }
    .big-text {
        font-size: 2.6em;
    }

    .back-style {
        animation-name: MOVE-BG;
        animation-duration: 60s;
        animation-timing-function: linear;
        animation-iteration-count: infinite;
        animation-play-state: paused;
        transition: all 1s;
    }
</style>
