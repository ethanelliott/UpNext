<template>
    <v-container v-if="loading" fluid fill-height>
        <v-layout justify-center align-center>
            <v-flex class="text-xs-center">
                <v-progress-circular :size="200" :width="15" color="primary" indeterminate></v-progress-circular>
            </v-flex>
        </v-layout>
    </v-container>
    <v-layout v-else-if="!loading" row>
        <v-dialog v-model="voteDialog" width="500" dark>
            <v-card>
                <v-card-actions>
                    <v-btn color="primary" flat @click="downvoteSong">
                        Downvote
                    </v-btn>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" flat @click="upvoteSong">
                        Upvote
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog v-model="searchDialog" fullscreen hide-overlay transition="dialog-bottom-transition">
            <v-card>
                <v-toolbar dark color="primary">
                    <v-btn icon dark @click="closeSearch">
                        <v-icon>close</v-icon>
                    </v-btn>
                    <v-toolbar-title>Search</v-toolbar-title>
                    <v-spacer></v-spacer>
                </v-toolbar>
                <v-text-field v-model="searchString" box label="Search by song name..." clearable @input="search"></v-text-field>
                <v-list two-line>
                    <template v-for="(track, index) in searchResults">
                        <v-list-tile :key="track.title" avatar>
                            <v-list-tile-avatar tile>
                                <img :src="track.artwork">
                            </v-list-tile-avatar>
                            <v-list-tile-content>
                                <v-list-tile-title>{{ track.name }}</v-list-tile-title>
                                <v-list-tile-sub-title class="text--primary">{{ track.artist }}</v-list-tile-sub-title>
                            </v-list-tile-content>
                            <v-list-tile-action>
                                <v-btn flat icon color="primary" @click="addSongToPlaylist(track)">
                                    <v-icon large>add</v-icon>
                                </v-btn>
                            </v-list-tile-action>
                        </v-list-tile>
                        <v-divider
                                v-if="index + 1 < searchResults.length"
                                :key="index"
                        ></v-divider>
                    </template>
                </v-list>
            </v-card>
        </v-dialog>
        <v-flex xs12 sm6 offset-sm3>
            <v-card>
                <v-list two-line>
                    <template v-for="(track, index) in queue">
                        <v-list-tile :key="track.title" avatar @click="showVoteDialog(track)">
                            <v-list-tile-avatar tile>
                                <img :src="track.artwork">
                            </v-list-tile-avatar>
                            <v-list-tile-content>
                                <v-list-tile-title>{{ track.name }}</v-list-tile-title>
                                <v-list-tile-sub-title class="text--primary">{{ track.artist }}</v-list-tile-sub-title>
                                <v-list-tile-sub-title>Added By: {{ track.added.name }}</v-list-tile-sub-title>
                            </v-list-tile-content>
                            <v-list-tile-action>
                                <v-btn flat icon color="primary">
                                    <span>{{ track.votes }}</span>
                                </v-btn>
                            </v-list-tile-action>
                        </v-list-tile>
                        <v-divider
                                v-if="index + 1 < queue.length"
                                :key="index"
                        ></v-divider>
                    </template>
                </v-list>
            </v-card>
        </v-flex>
        <v-speed-dial v-model="fab" bottom right direction="top" transition="slide-y-reverse-transition" class="ma-2" style="position: fixed; bottom:0;right:0;">
            <v-btn slot="activator" color="primary" dark fab @click="searchDialog = true">
                <v-icon>add</v-icon>
            </v-btn>
        </v-speed-dial>
        <v-snackbar v-model="snackbar" bottom :timeout="5000" color="secondary">
            {{ snackbarMessage }}
            <v-btn color="primary" dark flat @click="snackbar = false">
                Close
            </v-btn>
        </v-snackbar>
    </v-layout>
</template>

<script>
    const PROD = false
    import io from 'socket.io-client'
    import session from 'sessionstorage'

    export default {
        name: 'Queue',
        data: () => ({
            admin: false,
            fab: null,
            eventLoop: null,
            socket: null,
            voteDialog: null,
            searchDialog: null,
            loading: true,
            partyID: null,
            selectedTrack: null,
            queue: [],
            searchResults: [],
            searchString: '',
            snackbar: null,
            snackbarMessage: 'Hello'
        }),
        beforeDestroy() {
            this.socket.disconnect()
            clearInterval(this.eventLoop)
        },
        mounted() {
            let context = this
            // eslint-disable-next-line
            this.socket = io((PROD ? 'http://api.upnext.ml' : 'http://localhost:8888'))
            this.admin = (session.getItem('admin') === 'true')
            this.partyID = session.getItem('partyID')
            this.loading = false
            this.eventLoop = setInterval(function() {
                context.socket.emit('get-playlist', {id: context.partyID})
            }, 500)

            this.socket.on('give-playlist', (data) => {
                this.queue = data.playlist
            })

            this.socket.on('give-search-results', (data) => {
                let tracks = data.tracks.items
                let results =  tracks.map((track) => {
                    return {
                        id: track.id,
                        name: track.name,
                        artwork: track.album.images.find((element) => {
                            return element.height <= 64
                        }).url,
                        artist: track.artists[0].name
                    }
                })
                this.searchResults = results
            })
            this.socket.on('track-added-success', () => {
                this.snackbarMessage = 'Song added to Queue!'
                this.snackbar = true
            })
            this.socket.on('track-added-duplicate', () => {
                this.snackbarMessage = 'Song already in Queue!'
                this.snackbar = true
            })
        },
        methods: {
            closeSearch() {
                this.searchString = ''
                this.searchResults = []
                this.searchDialog = false
            },
            search() {
                this.socket.emit('search', {
                    partyid: this.partyID,
                    searchstring: this.searchString
                })
            },
            addSongToPlaylist(track) {
                this.socket.emit('playlist-add-song', {
                    partyid: this.partyID,
                    uuid: session.getItem('uuid'),
                    track: track
                })
            },
            showVoteDialog(track) {
                this.selectedTrack = track.id
                this.voteDialog = true
            },
            upvoteSong() {
                this.socket.emit('playlist-upvote-song', {
                    partyid: this.partyID,
                    track: this.selectedTrack,
                    uuid: session.getItem('uuid')
                })
                this.voteDialog = false
            },
            downvoteSong() {
                this.socket.emit('playlist-downvote-song', {
                    partyid: this.partyID,
                    track: this.selectedTrack,
                    uuid: session.getItem('uuid')
                })
                this.voteDialog = false
            }
        }
    }
</script>
