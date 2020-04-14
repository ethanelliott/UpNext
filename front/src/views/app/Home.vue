<template>
    <v-content :style="backgroundString" class="fill-height ma-0 pt-0">
        <v-app-bar app color="darker" dark>
            <v-icon color="primary">mdi-music-note-plus</v-icon>
            <v-toolbar-title class="headline text-uppercase ml-3">
                <span>Up</span>
                <span class="font-weight-light">Next</span>
            </v-toolbar-title>
            <v-spacer/>
            <v-toolbar-items>
                <v-btn @click="sharePartyCode" text x-large>
                    <span class="text-uppercase" style="letter-spacing: 10px;font-family: monospace;">
                        {{ code }}
                    </span>
                </v-btn>
                <v-btn @click="openAdminMenu" color="primary" icon v-if="isAdmin">
                    <v-icon>mdi-cog</v-icon>
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
                    This cannot be un-done... once it's gone, it's gone for good!
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
        <v-container class="ma-0 pa-0 fill-height" fluid v-if="hasState">
            <v-col class="ma-0 pa-0 mb-10">
                <v-row align="center" class="ma-0 pa-0" justify="center">
                    <v-card color="transparent" flat>
                        <v-skeleton-loader boilerplate type="image">
                            <v-dialog v-model="albumArtworkDialog" width="300">
                                <template v-slot:activator="{ on }">
                                    <v-img :src="albumArtwork" class="mx-5 elevation-20" max-width="600"
                                           min-height="300"
                                           v-on="on">
                                    </v-img>
                                </template>
                                <v-card height="200">
                                    <v-toolbar color="darker">
                                        <v-toolbar-title>
                                            About
                                        </v-toolbar-title>
                                        <v-spacer></v-spacer>
                                        <v-btn @click="albumArtworkDialog = false" color="primary" icon>
                                            <v-icon>mdi-close</v-icon>
                                        </v-btn>
                                    </v-toolbar>
                                    <v-container class="ma-0 pa-0" fluid>
                                        <v-col class="ma-0 pa-0">
                                            <v-row align="center" class="ma-0 pa-0" justify="center">
                                                <v-btn @click="openSpotifyUri" color="primary" text x-large>
                                                    Open In Spotify
                                                </v-btn>
                                            </v-row>
                                        </v-col>
                                    </v-container>
                                </v-card>
                            </v-dialog>
                        </v-skeleton-loader>
                        <v-card-text align="start" class="px-8">
                            <span class="trackName headline font-weight-medium text--primary">{{trackName}}</span>
                            <br>
                            <span class="trackArtist font-weight-thin font-italic text--primary">{{artistName}}</span>
                        </v-card-text>
                    </v-card>
                </v-row>
            </v-col>
        </v-container>
        <v-container class="ma-0 pa-0 mb-12" fluid v-else>
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
        <v-footer class="elevation-0" color="transparent" fixed>
            <v-container fluid>
                <v-row align="center" class="ma-0 pa-0" justify="center">
                    <v-col class="ma-0 pa-0" cols="12" lg="4" md="10" sm="12">
                        <v-row align="center" class="ma-0 pa-0" justify="center">
                            <v-col cols="6">
                                <v-row align="center" class="ma-0 pa-0" justify="center">
                                    <queue ref="queue" v-bind:playlist="playlist"
                                           v-bind:playlistId="playlistId" v-on:dialog="handleDialog"
                                           v-on:downvote="downvoteSong" v-on:upvote="upvoteSong"/>
                                </v-row>
                            </v-col>
                            <v-col cols="6">
                                <v-row align="center" class="ma-0 pa-0" justify="center">
                                    <add ref="add" v-on:add="addItem" v-on:dialog="handleDialog"
                                         v-on:search="search"/>
                                </v-row>
                            </v-col>
                        </v-row>
                    </v-col>
                </v-row>
            </v-container>
        </v-footer>
    </v-content>
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
            code: '',
            albumArtwork: '',
            trackName: '',
            artistName: '',
            trackId: '',
            playlist: [],
            playlistId: '',
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
            albumArtworkDialog: false
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
                    });
                }
            },
            openSpotifyUri: function () {
                this.overlay = false;
                window.open(`https://open.spotify.com/track/${this.trackId}`);
            },
            addItem(songId) {
                this.socket.emit('playlist-add-song', {
                    token: this.token,
                    data: {songId}
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
                this.socket.emit('playlist-clean', {
                    token: this.token,
                    data: {}
                });
            },
            downvoteSong(songId) {
                this.socket.emit('playlist-downvote-song', {
                    token: this.token,
                    data: {songId}
                });
            },
            upvoteSong(songId) {
                this.socket.emit('playlist-upvote-song', {
                    token: this.token,
                    data: {songId}
                });
            },
            transferPlaybackToSelected() {
                this.socket.emit('party-playback-transfer', {
                    token: this.token,
                    data: {deviceId: this.selectedDevice.id}
                });
                this.playbackDeviceDialog = false;
            },
            requestStateData() {
                this.socket.emit('party-state', {
                    token: this.token,
                    data: null
                });
                this.socket.emit('playlist-state', {
                    token: this.token,
                    data: null
                });
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
        },
        mounted() {
            window.scrollTo(0, 0);
            this.token = session.getItem('token');
            this.socket = io(this.$socketPath);
            this.socket.on('connect', () => {
                this.requestStateData();
                this.socket.emit('join', {token: this.token, data: null});
            });
            this.socket.on('party-leave', () => {
                this.navigateAway();
            });
            this.socket.on('party-state', (data) => {
                this.isLoading = false;
                console.table(data.playstate);
                this.trackName = data.playstate.trackName;
                this.albumArtwork = data.playstate.albumArtwork;
                this.artistName = data.playstate.artistName;
                this.trackId = data.playstate.trackId;
                this.code = data.party.code;
                let lv = data.playstate.colourLightVibrant;
                this.backgroundString = `background-image: linear-gradient(#${lv}ff 0%, rgba(0,0,0,1) 100%);`;
            });
            this.socket.on('playlist-state', (data) => {
                console.table(data);
            });
            this.socket.on('state-change', (data) => {
                console.table(data.playstate);
                this.isLoading = false;
                this.trackName = data.playstate.trackName;
                this.albumArtwork = data.playstate.albumArtwork;
                this.artistName = data.playstate.artistName;
                this.trackId = data.playstate.trackId;
                this.code = data.party.code;
                let lv = data.playstate.colourLightVibrant;
                this.backgroundString = `background-image: linear-gradient(#${lv}ff 0%, rgba(0,0,0,1) 100%);`;
            });
            this.socket.on('playlist-update', (data) => {
                console.table(data);
            });
            this.socket.on('search-success', (message) => {
                this.searchResult = message.data;
                this.$refs.add.$refs.search.gotResult(message.data);
            });
        }
    }
</script>
