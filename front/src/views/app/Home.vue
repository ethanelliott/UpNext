<template>
    <v-container :style="backgroundString" class="fill-height ma-0 pa-0">
        <v-app-bar app color="darker" dark>
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
                <v-btn @click="openAdminMenu" color="primary" icon v-if="isAdmin">
                    <v-icon>mdi-settings</v-icon>
                </v-btn>
                <v-menu offset-y v-else>
                    <template v-slot:activator="{ on }">
                        <v-btn color="primary" dark icon v-on="on">
                            <v-icon>mdi-dots-vertical</v-icon>
                        </v-btn>
                    </template>
                    <v-list color="darker">
                        <v-list-item @click="navigateAway">
                            <v-list-item-title>
                                <v-icon left>mdi-logout</v-icon>
                                Logout
                            </v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>
            </v-toolbar-items>
        </v-app-bar>
        <v-navigation-drawer class="text-left" fixed right temporary v-if="isAdmin" v-model="adminDrawer" width="300">
            <v-toolbar color="primary">
                <v-toolbar-title>Party Settings</v-toolbar-title>
            </v-toolbar>
            <v-card color="transparent" flat>
                <v-card-title>Media Controls</v-card-title>
                <v-container class="ma-0 pa-0">
                    <v-row align="center" class="ma-0 pa-0" justify="center">
                        <v-col align="center" class="ma-0 pa-0" justify="center">
                            <v-btn @click="togglePlayback" icon x-large>
                                <v-icon>mdi-play-pause</v-icon>
                            </v-btn>
                        </v-col>
                        <v-col align="center" class="ma-0 pa-0" justify="center">
                            <v-btn @click="skipNextSong" icon x-large>
                                <v-icon>mdi-skip-next</v-icon>
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card>
            <v-card color="transparent" flat>
                <v-container class="ma-0 pa-0">
                    <v-row align="center" class="ma-0 pa-0" justify="center">
                        <v-col align="center" justify="center">
                            <v-btn @click="playbackDeviceDialog = true" block tile>
                                <v-icon left>mdi-cast</v-icon>
                                {{ device.name }}
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card>
            <v-divider/>
            <v-list flat subheader two-line>
                <v-subheader>Chrome Stop Error</v-subheader>
                <v-list-item-group multiple>
                    <v-list-item>
                        <v-list-item-content>
                            <v-btn @click="fixChromeError" color="primary">Fix the Chrome Error</v-btn>
                        </v-list-item-content>
                    </v-list-item>
                </v-list-item-group>
            </v-list>
            <v-divider/>
            <v-list flat subheader two-line>
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
                    <v-list-item>
                        <v-list-item-content>
                            <v-btn @click="cleanTheQueue" color="primary">Clean the Queue</v-btn>
                        </v-list-item-content>
                    </v-list-item>
                </v-list-item-group>
            </v-list>
            <v-divider/>
            <v-list flat subheader two-line>
                <v-subheader>Danger Zone</v-subheader>
                <v-list-item-group multiple>
                    <v-list-item>
                        <v-list-item-content>
                            <v-btn @click="emptyTheQueue" color="warning">Empty the Queue</v-btn>
                        </v-list-item-content>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-content>
                            <v-btn @click="deleteSafetyDialog=true" color="error">Delete the Party</v-btn>
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
                    <v-btn @click="deleteTheParty" color="error" large>
                        Delete
                    </v-btn>
                    <v-btn @click="deleteSafetyDialog=false" color="primary" large>
                        Cancel
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog dark v-model="playbackDeviceDialog" width="500">
            <v-card>
                <v-card-title>
                    Select Device
                </v-card-title>
                <v-card-text>
                    <v-select :items="devices" item-text="name" item-value="id" label="Playback Device"
                              outlined return-object v-model="selectedDevice"/>
                </v-card-text>
                <v-card-actions>
                    <v-spacer/>
                    <v-btn @click="playbackDeviceDialog=false" large>
                        Cancel
                    </v-btn>
                    <v-btn @click="transferPlaybackToSelected" color="primary" large>
                        Apply
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
                    <v-btn @click="navigateAway" large>
                        Leave
                    </v-btn>
                    <v-btn @click="safetyDialog=false" color="primary" large>
                        Stay
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-container class="ma-0 pa-0" v-if="hasState">
            <v-row class="ma-0 pa-0">
                <v-col align="center" class="ma-0 pa-0" justify="center">
                    <v-card color="transparent" flat max-width="600">
                        <v-card color="transparent" flat>
                            <v-img :src="albumArtwork" @click="overlay = true" class="mx-5 elevation-20" max-width="600"
                                   min-height="300"/>
                            <v-overlay :value="overlay" absolute opacity="0.8">
                                <v-card color="transparent" flat height="35vh" width="100vw">
                                    <v-container class="fill-height">
                                        <v-container>
                                            <v-row align="center" justify="center">
                                                <v-col>
                                                    <v-btn @click="openSpotifyUri" color="primary" x-large>
                                                        Open In Spotify
                                                    </v-btn>

                                                </v-col>
                                            </v-row>
                                        </v-container>
                                    </v-container>
                                    <v-btn @click="overlay = false" absolute color="secondary" fab right top>
                                        <v-icon>mdi-close</v-icon>
                                    </v-btn>
                                </v-card>
                            </v-overlay>
                        </v-card>
                        <v-card-text align="start" class="mx-5">
                            <span class="trackName headline font-weight-medium text--primary">{{trackName}}</span>
                            <br>
                            <span class="trackArtist font-weight-thin font-italic text--primary">{{trackArtist}}</span>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
        </v-container>
        <v-container class="ma-0 pa-0 mb-12" v-if="hasState">
            <v-row class="ma-0 pa-0">
                <v-col align="center" class="ma-0 pa-0" justify="center">
                    <v-card color="transparent" flat max-width="600">
                        <v-container>
                            <v-row align-content="space-around" justify="space-around">
                                <queue ref="queue" v-bind:playlist="playlist"
                                       v-bind:playlistId="playlistId" v-on:dialog="handleDialog"
                                       v-on:downvote="downvoteSong" v-on:upvote="upvoteSong"/>
                                <add ref="add" v-on:add="addItem" v-on:dialog="handleDialog" v-on:search="search"/>
                            </v-row>
                        </v-container>
                    </v-card>
                </v-col>
            </v-row>
        </v-container>
        <v-container class="ma-0 pa-0 mb-12" v-else>
            <v-row class="ma-0 pa-0">
                <v-col align="center" class="ma-0 pa-0" justify="center">
                    <v-card color="transparent" flat max-width="600">
                        <v-icon color="primary" size="90">mdi-music-note-off</v-icon>
                        <v-card-title class="align-center justify-center">
                            No Playback Devices Found!
                        </v-card-title>
                        <v-card-text>
                            Start playing music on a device to get the party started!
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
        </v-container>
        <v-snackbar :timeout="2000" absolute bottom v-model="snackbarState">
            {{ snackbarMessage }}
            <v-btn @click="snackbarAction()" color="blue" text>
                {{ snackbarButton }}
            </v-btn>
        </v-snackbar>
        <v-footer dark fixed>
            <v-container align="center" justify="center">
                <v-row align="center" justify="center">
                    <v-progress-linear :color="progressColour" class="my-0" height="10" v-model="songProgress"/>
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
            hasState: true,
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
            openDialogs: [],
            safetyDialog: false,
            safeToLeave: false,
            deleteSafetyDialog: false,
            overlay: false,
            snackbarState: false,
            snackbarMessage: '',
            snackbarButton: '',
            snackbarAction: () => {
            },
            searchResult: {},
            isAdmin: false,
            adminDrawer: false,
            backgroundString: '',
            progressColour: 'primary',
            devices: [],
            device: {},
            selectedDevice: {},
            playbackDeviceDialog: false
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
            handleDialog(data) {
                if (data.state === "open") {
                    this.openDialogs.push(data);
                } else if (data.state === "close") {
                    if (this.openDialogs.filter(e => e.id === data.id).length > 0) {
                        this.openDialogs.pop();
                    }
                }
            },
            showSnackbar(message, button, action) {
                this.snackbarMessage = message;
                this.snackbarButton = button;
                this.snackbarAction = action;
                this.snackbarState = true;
            },
            openAdminMenu() {
                this.adminDrawer = true;
            },
            skipNextSong() {
                this.socket.emit('party-playback-next', {
                    token: this.token,
                    data: {}
                })
            },
            togglePlayback() {
                this.socket.emit('party-playback-toggle', {
                    token: this.token,
                    data: {}
                })
            },
            fixChromeError() {
                this.socket.emit('party-fix-chrome', {
                    token: this.token,
                    data: {}
                })
            },
            deleteTheParty() {
                this.socket.emit('party-delete', {
                    token: this.token,
                    data: {}
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
                window.open(`https://open.spotify.com/track/${this.trackId}`);
            },
            addItem(songId) {
                let t = this;
                this.socket.emit('playlist-add-song', {
                    token: t.token,
                    data: {
                        songId
                    }
                });
            },
            search() {
                this.safeToLeave = true;
                this.$router.push('/app/search');
            },
            emptyTheQueue() {
                this.socket.emit('playlist-clear', {
                    token: this.token,
                    data: {}
                });
            },
            cleanTheQueue() {
                // remove songs with a negative score
                this.socket.emit('playlist-clean', {
                    token: this.token,
                    data: {}
                });
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
            },
            transferPlaybackToSelected() {
                this.socket.emit('party-playback-transfer', {
                    token: this.token,
                    data: {
                        deviceId: this.selectedDevice.id
                    }
                });
                this.playbackDeviceDialog = false;
            }
        },
        beforeRouteLeave(to, from, next) {
            if (this.safeToLeave) {
                next();
            } else {
                next(false);
            }
            if (this.openDialogs.length === 0) {
                this.safetyDialog = true;
            } else {
                let x = this.openDialogs.pop();
                x.close();
            }
        },
        beforeDestroy() {
            this.socket.disconnect();
            clearInterval(this.eventLoop);
        },
        mounted() {
            window.scrollTo(0, 0);
            let t = this;
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
                if (state.trackName) {
                    t.hasState = true;
                    t.device = state.device;
                    t.albumArtwork = state.albumArtwork.filter(e => e.width > 500)[0].url;
                    t.trackName = state.trackName;
                    t.trackArtist = state.artistName;
                    t.songProgress = state.progress / state.duration * 100;
                    t.trackId = state.trackId;
                    let v = message.data.colours.vibrant;
                    let lv = message.data.colours.lightVibrant;
                    t.backgroundString = `background-image: linear-gradient(rgba(${lv.r}, ${lv.g}, ${lv.b}, 0.5) 10%, rgba(0,0,0,1) 80%);`;
                    t.progressColour = `rgb(${v.r}, ${v.g}, ${v.b})`;
                } else {
                    t.hasState = false;
                }
                t.devices = message.data.state.availableDevices;
                t.isAdmin = message.data.admin;
                t.code = message.data.code;
            });
            t.socket.on('got-state-playlist', (message) => {
                t.playlistId = message.data.playlistId;
                t.playlist = message.data.playlist;
            });

            t.socket.on('song-upvoted', (message) => {
                t.showSnackbar('Song Upvoted', '', () => {
                })
            });
            t.socket.on('song-downvoted', (message) => {
                t.showSnackbar('Song Downvoted', '', () => {
                })
            });
            t.socket.on('playlist-song-added', (message) => {
                t.showSnackbar('Song Added', 'Undo', () => {
                    // emit an undo socket message
                    t.socket.emit('playlist-remove-song', {
                        token: this.token,
                        data: {
                            songId: message.data.songId
                        }
                    });
                })
            });
            t.socket.on('search-success', (message) => {
                t.searchResult = message.data;
                t.$refs.add.$refs.search.gotResult(message.data);
            });

            t.socket.on('search-fail', (message) => {
                // console.log(message);
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
