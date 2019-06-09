<template>
    <v-container
            :style="backgroundColourString"
            class="back-style"
            fill-height fluid>
        <v-layout align-center justify-center v-if="loading">
            <v-flex class="text-xs-center">
                <v-progress-circular :size="200" :width="15" color="primary" indeterminate></v-progress-circular>
            </v-flex>
        </v-layout>
        <v-layout align-center justify-center v-if="!loading">
            <v-flex lg6 md8 sm8 xs12>
                <v-flex>
                    <v-layout justify-center>
                        <v-flex class="text-xs-center">
                            <img :src="albumArtwork" class="elevation-20" style="width:100%;max-width: 50vh;"/>
                        </v-flex>
                    </v-layout>
                    <v-layout justify-center>
                        <v-flex class="mt-3">
                            <span class="headline font-weight-medium">{{trackName}}</span>
                            <p class="subheading font-weight-thin font-italic">{{trackArtist}}</p>
                        </v-flex>
                    </v-layout>
                    <v-layout justify-center>
                        <v-flex class="text-xs-center" xs-6>
                            <v-btn @click="voteSkip" color="white" fab flat medium>
                                <v-icon x-large>skip_next</v-icon>
                            </v-btn>
                        </v-flex>
                        <v-flex class="text-xs-center" xs-6>
                            <v-btn color="white" fab flat medium to="/m/home/queue">
                                <v-icon x-large>queue_music</v-icon>
                            </v-btn>
                        </v-flex>
                    </v-layout>
                </v-flex>
            </v-flex>
        </v-layout>
        <v-footer class="elevation-20" dark fixed>
            <v-container class="ma-0 pa-2" fluid>
                <v-layout align-center justify-center>
                    <v-flex>
                        <v-progress-linear :color="progressColour" class="my-0" height="7"
                                           v-model="trackPos"></v-progress-linear>
                    </v-flex>
                </v-layout>
            </v-container>
        </v-footer>
        <v-snackbar :timeout="5000" bottom color="secondary" v-model="snackbar">
            {{ snackbarMessage }}
            <v-btn @click="snackbar = false" color="primary" dark flat>
                Close
            </v-btn>
        </v-snackbar>
    </v-container>
</template>

<script>
    import io from 'socket.io-client'
    import session from 'localStorage'
    import axios from 'axios'

    export default {
        name: "Home",
        data: () => ({
            socket: null,
            loading: true,
            partyID: null,
            backgroundColourString: '',
            albumArtwork: null,
            defaultAlbumArtwork: "https://discussions.apple.com/content/attachment/881765040",
            previousTrack: null,
            trackName: null,
            trackArtist: null,
            trackPos: 0,
            trackLength: 0,
            playing: false,
            progressColour: 'primary',
            progressColourBackground: 'rgba(0,0,0,0)',
            voteSkipDialog: null,
            snackbar: null,
            snackbarMessage: 'Hello',
        }),
        beforeDestroy() {
            this.socket.disconnect()
        },
        mounted() {
            window.scrollTo(0, 0)
            let t = this
            t.partyID = session.getItem('partyID')
            console.log(t.partyID)
            axios.get(`/party/test/${t.partyID}`).then((response) => {
                console.log('HELLO', response.data)
                if (response.data.valid === false) {
                    t.$router.push(`/logout`)
                }
            }).catch(error => {
            })
            t.socket = io(t.$socketPath)
            t.socket.on('connect', () => {
                t.socket.on('disconnect', () => {
                })
                t.socket.emit('start-player-loop', {id: t.partyID})
            })
            t.socket.on('event-loop', (data) => {
                if (data) {
                    let d = data.data
                    t.playing = d.is_playing
                    t.trackPos = (d.progress_ms / d.item.duration_ms) * 100
                    t.albumArtwork = d.item.album.images[0].url
                    t.trackName = d.item.name
                    t.trackArtist = d.item.artists.map(e => e.name).reduce((a, b) => `${a}${b}, `, ``).slice(0, -2)
                    if (t.previousTrack !== t.trackName) {
                        t.previousTrack = t.trackName
                        t.socket.emit('get-colours', t.partyID)
                    }
                    if (this.trackName !== null) {
                        this.loading = false
                    }
                }
            })
            t.socket.on('got-colours', (colours) => {
                t.progressColour = colours.progress
                t.progressColourBackground = colours.back
                t.backgroundColourString = 'background-image: linear-gradient(' + t.progressColourBackground + ' 10%, rgba(0,0,0,1) 90%);'
            })
            t.socket.on('vote-voted', (data) => {
                if (data.success) {
                    t.snackbarMessage = 'Skip vote has been added'
                } else {
                    t.snackbarMessage = 'You have already voted!'
                }
                t.voteSkipDialog = false
                t.snackbar = true
            })
        },
        methods: {
            voteSkip() {
                this.socket.emit('vote-skip', {
                    id: this.partyID,
                    uuid: session.getItem('uuid')
                })
            }
        }
    }
</script>

<style>
    .back-style {
        background-image: linear-gradient(rgba(0, 0, 0, 0) 10%, rgba(0, 0, 0, 1) 90%);
    }
</style>
