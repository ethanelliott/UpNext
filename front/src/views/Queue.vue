<template>
    <v-container fluid>
        <v-dialog dark v-model="voteDialog" width="500">
            <v-card>
                <v-card-actions>
                    <v-btn @click="downvoteSong" color="primary" flat>
                        Downvote
                    </v-btn>
                    <v-spacer></v-spacer>
                    <v-btn @click="upvoteSong" color="primary" flat>
                        Upvote
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-toolbar dark fixed>
            <v-btn dark icon to="/m/home">
                <v-icon>close</v-icon>
            </v-btn>
            <v-toolbar-title>Queue</v-toolbar-title>
            <v-spacer></v-spacer>
            <!--                    <v-flex v-if="searchQueue">-->
            <!--                        <v-text-field box clearable label="Search" v-model="searchString"></v-text-field>-->
            <!--                    </v-flex>-->
            <!--                    <v-btn @click="searchQueue = !searchQueue" dark icon>-->
            <!--                        <v-icon>search</v-icon>-->
            <!--                    </v-btn>-->
        </v-toolbar>
        <v-flex align-center height="100%" justify-center v-if="queue.length <= 0">
            <p class="my-5">&nbsp;</p>
            <v-flex class="text-xs-center">
                <v-icon color="primary" size="120">music_note</v-icon>
                <p class="pt-5 title">The Queue is Empty!</p>
                <p class="pt-2 subheading">Click the + below to get the party started</p>
            </v-flex>
        </v-flex>
        <v-flex offset-sm3 sm6 v-else xs12>
            <v-list two-line>
                <template v-for="(track, index) in queue">
                    <v-list-tile :key="track.title" @click="showVoteDialog(track)" avatar>
                        <v-list-tile-avatar tile>
                            <img :src="track.artwork">
                        </v-list-tile-avatar>
                        <v-list-tile-content>
                            <v-list-tile-title>{{ track.name }}</v-list-tile-title>
                            <v-list-tile-sub-title class="text--primary">{{ track.artist }}
                            </v-list-tile-sub-title>
                            <v-list-tile-sub-title>Added By: {{ track.added.name }}</v-list-tile-sub-title>
                        </v-list-tile-content>
                        <v-list-tile-action>
                            <v-btn color="primary" flat icon>
                                <span>{{ track.votes }}</span>
                            </v-btn>
                        </v-list-tile-action>
                    </v-list-tile>
                    <v-divider
                            :key="index"
                            v-if="index + 1 < queue.length"
                    ></v-divider>
                </template>
            </v-list>
        </v-flex>
        <v-speed-dial bottom class="ma-2" direction="top" right style="position: fixed; bottom:0;right:0;"
                      transition="slide-y-reverse-transition" v-model="fab">
            <v-btn @click="openSearch" color="primary" dark fab slot="activator">
                <v-icon>add</v-icon>
            </v-btn>
        </v-speed-dial>
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

    export default {
        name: "Queue",
        data: () => ({
            socket: null,
            loading: true,
            partyID: null,
            snackbar: null,
            snackbarMessage: '',
            voteDialog: null,
            queue: [],
            fab: null,
        }),
        beforeDestroy() {
            this.socket.disconnect()
        },
        mounted() {
            window.scrollTo(0, 0)
            let t = this
            t.partyID = session.getItem('partyID')
            t.socket = io(t.$socketPath)
            t.socket.on('connect', () => {
                t.socket.on('disconnect', () => {
                })
                t.socket.emit('get-playlist', {id: t.partyID})
            })
            t.eventLoop = setInterval(function () {
                t.socket.emit('get-playlist', {id: t.partyID})
            }, 1000)
            t.socket.on('give-playlist', (data) => {
                t.queue = data.playlist
            })
            this.socket.on('vote-voted', (data) => {
                if (data.success) {
                    this.snackbarMessage = 'Skip vote has been added'
                } else {
                    this.snackbarMessage = 'You have already voted!'
                }
                this.voteSkipDialog = false
                this.snackbar = true
            })
        },
        methods: {
            openSearch() {
                this.$router.push('/m/home/queue/search')
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

<style>
    .back-style {
        background-image: linear-gradient(rgba(0, 0, 0, 0) 10%, rgba(0, 0, 0, 1) 90%);
    }
</style>
