<template>
    <v-container class="fill-height ma-0 pa-0" :style="backgroundString">
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
                <v-btn v-if="isAdmin" @click="openAdminMenu" icon color="primary">
                    <v-icon>mdi-settings</v-icon>
                </v-btn>
            </v-toolbar-items>
        </v-app-bar>
        <v-navigation-drawer v-if="isAdmin" width="300" v-model="adminDrawer" fixed right temporary class="text-left">
            <v-toolbar color="primary">
                <v-toolbar-title>Party Settings</v-toolbar-title>
            </v-toolbar>
            <v-card>
                <v-card-title>Media Controls</v-card-title>
                <v-container>
                    <v-row justify="center" align="center">
                        <v-col align="center" justify="center">
                            <v-btn x-large icon @click="togglePlayback"><v-icon>mdi-play-pause</v-icon></v-btn>
                        </v-col>
                        <v-col align="center" justify="center">
                            <v-btn x-large icon @click="skipNextSong"><v-icon>mdi-skip-next</v-icon></v-btn>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card>
            <v-divider/>
            <v-list subheader two-line flat>
                <v-subheader>Chrome Stop Error</v-subheader>
                <v-list-item-group multiple>
                    <v-list-item>
                        <v-list-item-content>
                            <v-btn color="primary" @click="fixChromeError">Fix the Chrome Error</v-btn>
                        </v-list-item-content>
                    </v-list-item>
                </v-list-item-group>
            </v-list>
            <v-divider/>
            <v-list subheader two-line flat>
                <v-subheader>Playback Settings</v-subheader>
                <v-list-item-group multiple>
                    <v-list-item>
                        <template v-slot:default="{ active, toggle }">
                            <v-list-item-action>
                                <v-switch color="primary" v-model="autoPlay"/>
                            </v-list-item-action>

                            <v-list-item-content>
                                <v-list-item-title>AutoPlay</v-list-item-title>
                                <v-list-item-subtitle>Auto-fill an empty queue</v-list-item-subtitle>
                            </v-list-item-content>
                        </template>
                    </v-list-item>
                </v-list-item-group>
            </v-list>
            <v-divider/>
            <v-list subheader two-line flat>
                <v-subheader>Danger Zone</v-subheader>
                <v-list-item-group multiple>
                    <v-list-item>
                        <v-list-item-content>
                            <v-btn color="error" @click="deleteSafetyDialog=true">Delete the Party</v-btn>
                        </v-list-item-content>
                    </v-list-item>
                </v-list-item-group>
            </v-list>
        </v-navigation-drawer>
        <v-dialog dark v-model="deleteSafetyDialog" width="500">
            <v-card>
                <v-card-title>
                    Are you sure you want to Delete the party?
                </v-card-title>
                <v-card-text>
                    This cannot be un-done... once it's gone it's gone for good!
                </v-card-text>
                <v-card-actions>
                    <v-spacer/>
                    <v-btn large color="error" @click="deleteTheParty">
                        Delete
                    </v-btn>
                    <v-btn color="primary" large @click="deleteSafetyDialog=false">
                        Cancel
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
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
                            <v-img @click="overlay = true" class="mx-5 elevation-20" :src="albumArtwork" max-width="600"
                                   min-height="300"/>
                            <v-overlay absolute opacity="0.8" :value="overlay">
                                <v-card flat color="transparent" height="35vh" width="100vw">
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
                                <queue ref="queue" v-model="dialogs.queue" v-bind:playlistId="playlistId" v-bind:playlist="playlist"
                                       v-on:upvote="upvoteSong" v-on:downvote="downvoteSong"/>
                                <add ref="add" v-model="dialogs.add" v-on:add="addItem" v-on:search="search"/>
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
                    <v-progress-linear class="my-0" :color="progressColour" height="10" v-model="songProgress"/>
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
            autoPlay: false,
            dialogs: {
                queue: false,
                add: false
            },
            safetyDialog: false,
            safeToLeave: false,
            deleteSafetyDialog: false,
            overlay: false,
            snackbar: {
                state: false,
                message: '',
                button: '',
                action: () => {
                }
            },
            searchResult: {},
            isAdmin: false,
            adminDrawer: false,
            backgroundString: '',
            progressColour: 'primary'
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
            openAdminMenu() {
                this.adminDrawer = true;
            },
            skipNextSong() {
                this.socket.emit('party-playback-next', {
                    token: this.token,
                    data: { }
                })
            },
            togglePlayback() {
                this.socket.emit('party-playback-toggle', {
                    token: this.token,
                    data: { }
                })
            },
            fixChromeError() {
                this.socket.emit('party-fix-chrome', {
                    token: this.token,
                    data: { }
                })
            },
            deleteTheParty() {
                this.socket.emit('party-delete', {
                    token: this.token,
                    data: { }
                })
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
                t.isAdmin = message.data.admin;
                t.code = message.data.code;
                let v = message.data.colours.vibrant;
                let lv = message.data.colours.lightVibrant;
                t.backgroundString = `background-image: linear-gradient(rgba(${lv.r}, ${lv.g}, ${lv.b}, 0.5) 10%, rgba(0,0,0,1) 80%);`;
                t.progressColour = `rgb(${v.r}, ${v.g}, ${v.b})`;
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

            t.socket.on('search-success', (message) => {
                t.searchResult = message.data;
                t.$refs.add.$refs.search.gotResult(message.data);
            });

            t.socket.on('search-fail', (message) => {
                console.log(message);
                //UH-OH SOMETHING HAPPENED
            });
        }
    }
</script>

<style>
    .cool-background {
        background-image: linear-gradient(rgba(0, 176, 255, 0.5) 5%, #303030 70%);
    }
</style>
