<template>
    <v-container class="fill-height ma-0 pa-0">
        <v-app-bar app dark color="darker">
            <v-icon color="primary">mdi-music-note-plus</v-icon>
            <v-toolbar-title class="headline text-uppercase ml-3">
                <span>Up</span>
                <span class="font-weight-light">Next</span>
            </v-toolbar-title>
            <v-spacer/>
            <v-toolbar-items>
                <v-btn @click="sharePartyCode" text x-large>
                    <span class="text-uppercase" style="letter-spacing: 10px;font-family: monospace;">{{ code }}</span>
                </v-btn>
            </v-toolbar-items>
        </v-app-bar>
        <v-overlay :value="isLoading">
            <v-progress-circular color="primary" indeterminate size="64"/>
        </v-overlay>
        <v-dialog dark v-model="safetyDialog" width="500">
            <v-card>
                <v-card-title>
                    Are you sure you want to leave?
                </v-card-title>
                <v-card-text>
                    If you leave the party, you will have to sign-in again!
                </v-card-text>
                <v-card-actions>
                    <v-spacer/>
                    <v-btn large @click="navigateAway">
                        Leave
                    </v-btn>
                    <v-btn color="primary" large @click="safetyDialog=false">
                        Stay
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-container class="ma-0 pa-0">
            <v-row class="ma-0 pa-0">
                <v-col class="ma-0 pa-0" align="center" justify="center">
                    <v-card color="transparent" flat max-width="600">
                        <v-card flat color="transparent">
                            <v-img @click="overlay = true" class="mx-5" :src="albumArtwork" max-width="600"
                                   min-height="300"/>
                            <v-overlay absolute opacity="0.8" :value="overlay">
                                <v-card flat color="transparent" height="35vh" width="100vw" >
                                    <v-container class="fill-height">
                                        <v-container>
                                            <v-row align="center" justify="center">
                                                <v-col>
                                                    <v-btn x-large color="primary" @click="openSpotifyUri">
                                                        Open In Spotify
                                                    </v-btn>

                                                </v-col>
                                            </v-row>
                                        </v-container>
                                    </v-container>
                                    <v-btn color="secondary" fab absolute top right @click="overlay = false">
                                        <v-icon>mdi-close</v-icon>
                                    </v-btn>
                                </v-card>
                            </v-overlay>
                        </v-card>
                        <v-card-text class="mx-5" align="start">
                            <span class="trackName headline font-weight-medium text--primary">{{trackName}}</span>
                            <br>
                            <span class="trackArtist font-weight-thin font-italic text--primary">{{trackArtist}}</span>
                        </v-card-text>

                    </v-card>
                </v-col>
            </v-row>
        </v-container>
        <v-container class="ma-0 pa-0 mb-12">
            <v-row class="ma-0 pa-0">
                <v-col class="ma-0 pa-0" align="center" justify="center">
                    <v-card color="transparent" flat max-width="600">
                        <v-container>
                            <v-row align-content="space-around" justify="space-around">
                                <queue v-model="dialogs.queue" v-bind:playlistId="playlistId" v-bind:playlist="playlist" v-on:upvote="upvoteSong" v-on:downvote="downvoteSong" />
                                <add v-model="dialogs.add" v-on:add="addItem" v-on:search="search" v-bind:searchResult="searchResult" />
                            </v-row>
                        </v-container>
                    </v-card>
                </v-col>
            </v-row>
        </v-container>
        <v-snackbar v-model="snackbar.state" :timeout="2000">
            {{ snackbar.message }}
            <v-btn color="blue" text @click="snackbar.action()">
                {{ snackbar.button }}
            </v-btn>
        </v-snackbar>
        <v-footer dark fixed>
            <v-container align="center" justify="center">
                <v-row align="center" justify="center">
                    <v-progress-linear class="my-0" color="primary" height="10" v-model="songProgress"/>
                </v-row>
            </v-container>
        </v-footer>
    </v-container>
</template>

<script>
    import io from 'socket.io-client'
    import session from 'localStorage'
    import Queue from './DialogQueue'
    import Add from './DialogAdd'

    export default {
        name: "Home",
        data: () => ({
            isLoading: true,
            socket: null,
            token: null,
            eventLoop: null,
            code: '',
            albumArtwork: '',
            trackName: '',
            trackArtist: '',
            trackId: '',
            songProgress: 0,
            playlist: [],
            playlistId: '',
            dialogs: {
                queue: false,
                add: false
            },
            safetyDialog: false,
            safeToLeave: false,
            overlay: false,
            snackbar: {
                state: false,
                message: '',
                button: '',
                action: () => {}
            },
            searchResult: []
        }),
        components: {
            'queue': Queue,
            'add': Add
        },
        methods: {
            navigateAway() {
                this.safeToLeave = true;
                this.$router.push('/leave');
            },
            showSnackbar(message, button, action) {
                this.snackbar.message = message;
                this.snackbar.button = button;
                this.snackbar.action = action;
                this.snackbar.state = true;
            },
            sharePartyCode() {
                if (navigator.share) {
                    navigator.share({
                        title: 'UpNext Party Code',
                        text: 'Join the party!',
                        url: `https://upnext.cool/join?c=${this.code}`,
                    })
                        .then(() => {
                        })
                        .catch((error) => {
                        });
                }
            },
            openSpotifyUri: function () {
                window.open(`spotify:track:${this.trackId}`, '_blank');
            },
            addItem(songId) {
                let t = this;
                this.socket.emit('playlist-add-song', {
                    token: t.token,
                    data: {
                        songId
                    }
                })
            },
            search(query) {
                this.socket.emit('search', {
                    token: this.token,
                    data: {
                        query
                    }
                })
            },
            downvoteSong(songId) {
                this.socket.emit('downvote-song', {
                    token: this.token,
                    data: {
                        songId
                    }
                });
            },
            upvoteSong(songId) {
                this.socket.emit('upvote-song', {
                    token: this.token,
                    data: {
                        songId
                    }
                });
            }
        },
        beforeRouteLeave(to, from, next) {
            if (this.safeToLeave) {
                next();
            } else {
                next(false);
            }
            // clever way to use dialogs to feel like navigation
            let noNav = false;
            let knownDialogs = Object.keys(this.dialogs);
            for (let i = 0; i < knownDialogs.length; i++) {
                if (this.dialogs[knownDialogs[i]]) {
                    this.dialogs[knownDialogs[i]] = false
                    noNav = noNav || true;
                } else {
                    noNav = noNav || false;
                }
            }
            if (!noNav) {
                this.safetyDialog = true;
            }
        },
        beforeDestroy() {
            this.socket.disconnect();
            clearInterval(this.eventLoop);
        },
        mounted() {
            window.scrollTo(0, 0);
            let t = this;
            // This might solve all the reload delay issues
            // setInterval(() => {
            //     if (!document.hasFocus()) {
            //         t.isLoading = true;
            //     }
            // }, 1000);
            t.token = session.getItem('token');
            t.socket = io(t.$socketPath);
            t.socket.on('connect', () => {
                t.eventLoop = setInterval(() => {
                    t.socket.emit('get-state', {
                        token: t.token,
                        data: null
                    });
                    t.socket.emit('get-state-playlist', {
                        token: t.token,
                        data: null
                    });
                }, 1000);
            });
            t.socket.on('party-leave', () => {
                t.navigateAway();
            });
            t.socket.on('got-state', (message) => {
                t.isLoading = false;
                let state = message.data.state;
                t.albumArtwork = state.albumArtwork.filter(e => e.width > 500)[0].url;
                t.trackName = state.trackName;
                t.trackArtist = state.artistName;
                t.songProgress = state.progress / state.duration * 100;
                t.trackId = state.trackId;
                t.code = message.data.code;
            });
            t.socket.on('got-state-playlist', (message) => {
                t.playlistId = message.data.playlistId;
                t.playlist = message.data.playlist;
            });

            t.socket.on('song-upvoted', (message) => {
                t.showSnackbar('Song Upvoted', 'Undo', () => {
                    // emit an undo socket message
                })
            });
            t.socket.on('song-downvoted', (message) => {
                t.showSnackbar('Song Downvoted', 'Undo', () => {
                    // emit an undo socket message
                })
            });
        }
    }
</script>

<style>
    .trackName {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
</style>
