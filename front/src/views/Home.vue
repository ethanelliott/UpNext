<template>
    <v-container fluid fill-height>
        <v-dialog v-model="voteSkipDialog" width="500" dark>
            <v-card>
                <v-card-actions>
                    <v-btn color="error" dark large block @click="voteSkip">
                        Vote to Skip
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog v-model="settingsDialog" fullscreen hide-overlay transition="dialog-bottom-transition">
            <v-card>
                <v-toolbar dark color="primary">
                    <v-btn icon dark @click="settingsDialog = false">
                        <v-icon>close</v-icon>
                    </v-btn>
                    <v-toolbar-title>Settings</v-toolbar-title>
                </v-toolbar>
                <v-list subheader>
                    <v-subheader>Setup</v-subheader>
                    <!--<v-list-tile avatar >-->
                        <!--<v-list-tile-content>-->
                            <!--<v-list-tile-title>Jump to Playlist</v-list-tile-title>-->
                            <!--<v-list-tile-sub-title>Click to set the current playlist to the UpNext playlist</v-list-tile-sub-title>-->
                        <!--</v-list-tile-content>-->
                    <!--</v-list-tile>-->
                </v-list>
                <v-divider></v-divider>
            </v-card>
        </v-dialog>
        <v-layout v-if="loading" justify-center align-center>
            <v-flex class="text-xs-center">
                <v-progress-circular :size="200" :width="15" color="primary" indeterminate></v-progress-circular>
            </v-flex>
        </v-layout>
        <v-layout v-if="!loading" justify-center align-center>
            <v-flex lg6 md8 sm8 xs12>
                <v-container>
                    <v-layout justify-center>
                        <v-flex class="text-xs-center">
                            <img :src="albumArtwork" class="elevation-15" style="width:90%;max-width:400px;" />
                        </v-flex>
                    </v-layout>
                    <v-layout v-if="admin" justify-center>
                        <v-flex xs12 class="text-xs-center">
                            <v-progress-linear color="primary" height="5" v-model="trackPos"></v-progress-linear>
                        </v-flex>
                    </v-layout>
                    <v-layout v-else justify-center>
                        <v-flex xs1></v-flex>
                        <v-flex xs10 class="text-xs-center mt-3">
                            <v-progress-linear color="primary" height="15" v-model="trackPos"></v-progress-linear>
                        </v-flex>
                        <v-flex xs1 class="text-xs-center mt-3">
                            <v-btn flat icon @click="voteSkipDialog = true">
                                <v-icon>more_vert</v-icon>
                            </v-btn>
                        </v-flex>
                    </v-layout>
                    <v-layout justify-center>
                        <v-flex v-if="admin" class="text-xs-center">
                            <span class="title">{{trackName}}</span>
                            <p class="font-weight-thin">{{trackArtist}}</p>
                        </v-flex>
                        <v-flex v-else class="text-xs-center mt-3">
                            <span class="title">{{trackName}}</span>
                            <p class="font-weight-thin">{{trackArtist}}</p>
                        </v-flex>
                    </v-layout>
                    <v-layout v-if="admin" justify-center>
                        <v-flex xs-4 class="text-xs-center">
                            <v-btn medium fab flat color="primary" @click="showSettings">
                                <v-icon>settings</v-icon>
                            </v-btn>
                        </v-flex>
                        <v-flex xs-4 class="text-xs-center">
                            <v-btn outline medium fab color="primary" @click="toggleplayback">
                                <v-icon v-if="playing">pause</v-icon>
                                <v-icon v-else>play_arrow</v-icon>
                            </v-btn>
                        </v-flex>
                        <v-flex xs-4 class="text-xs-center">
                            <v-btn medium flat fab color="primary" @click="nextSong">
                                <v-icon>skip_next</v-icon>
                            </v-btn>
                        </v-flex>
                    </v-layout>
                </v-container>
            </v-flex>
        </v-layout>
        <v-snackbar v-model="snackbar" bottom :timeout="5000" color="secondary">
            {{ snackbarMessage }}
            <v-btn color="primary" dark flat @click="snackbar = false">
                Close
            </v-btn>
        </v-snackbar>
    </v-container>
</template>

<script>
    const PROD = false
    import io from 'socket.io-client'
    import session from 'sessionstorage'
    export default {
        name: "Home",
        data: () => ({
            admin: false,
            socket: null,
            loading: true,
            partyID: null,
            albumArtwork: null,
            trackName: null,
            trackArtist: null,
            trackPos: 0,
            playing: false,
            voteSkipDialog: null,
            snackbar: null,
            snackbarMessage: 'Hello',
            settingsDialog: false,
        }),
        beforeDestroy() {
            this.socket.disconnect()
        },
        mounted() {
            this.partyID = session.getItem('partyID')
            this.admin = (session.getItem('admin') === 'true')

            this.socket = io((PROD ? 'http://api.upnext.ml' : 'http://localhost:8888'))
            this.socket.on('connect', () => {
                this.socket.on('disconnect', () => { })
                this.socket.emit('start-player-loop', {id: this.partyID})
            })
            this.socket.on('event-loop', (data) => {
                if (data) {
                    let d = data.data
                    this.playing = d.is_playing
                    this.trackPos = (d.progress_ms / d.item.duration_ms) * 100
                    this.albumArtwork = d.item.album.images[0].url
                    this.trackName = d.item.name
                    this.trackArtist = d.item.artists[0].name
                    if (this.trackName !== null) {
                        this.loading = false
                    }
                }
            })
        },
        methods: {
            showSettings() {
                this.settingsDialog = true
            },
            nextSong() {
                this.socket.emit('next-song', {
                    id: this.partyID
                })
            },
            toggleplayback() {
                this.socket.emit('toggle-playback', {
                    id: this.partyID,
                    playback: !this.playing
                })
            },
            voteSkip() {
                this.voteSkipDialog = false
                this.snackbarMessage = 'Skip vote has been added'
                this.snackbar = true
            }
        }
    }
</script>
