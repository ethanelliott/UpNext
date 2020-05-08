<template>
    <v-navigation-drawer
            :style="backgroundString"
            color="transparent"
            dark
            permanent
            stateless
            touchless
            width="100%"
    >
        <template v-slot:prepend>
            <v-toolbar color="darker" dark>
                <v-icon color="primary">mdi-music-note-plus</v-icon>
                <v-toolbar-title class="headline text-uppercase ml-3">
                    <span>Up</span>
                    <span class="font-weight-light">Next</span>
                </v-toolbar-title>
                <v-spacer/>
                <v-toolbar-items>
                    <app-share-dialog :code="code" @dialog="handleDialog"></app-share-dialog>
                    <app-admin-dialog
                            @dialog="handleDialog"
                            @event="handleEvent"
                            @leave="navigateAway"
                            @media="addMediaView"
                            v-if="isAdmin"
                    >
                    </app-admin-dialog>
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
            </v-toolbar>
        </template>
        <template v-slot:default>
            <v-container class="ma-0 pa-0 fill-height" fluid v-if="hasState">
                <v-col class="ma-0 pa-0">
                    <v-row align="center" class="ma-0 pa-0" justify="center">
                        <v-card color="transparent" flat>
                            <v-container class="ma-0 pa-0">
                                <v-row class="ma-0 pa-0">
                                    <v-col class="ma-0 pa-0">
                                        <v-card color="transparent" elevation="0" height="0" width="600"></v-card>
                                        <app-current-artwork-dialog
                                                :album-artwork="albumArtwork"
                                                :song-stats="songStats"
                                                :track-id="trackId"
                                                @dialog="handleDialog"
                                        ></app-current-artwork-dialog>
                                    </v-col>
                                </v-row>
                                <v-row class="ma-0 pa-0 mx-5">
                                    <v-col class="text-left"
                                           style="text-overflow: ellipsis;white-space: nowrap;overflow: hidden;">
                                        <v-card class="ma-0 pa-0" color="transparent" elevation="0" max-width="600">
                                            <span class="headline font-weight-medium text--primary">{{trackName}}</span>
                                            <br>
                                            <span class="font-weight-thin font-italic text--primary">{{artistName}}</span>
                                            <br>
                                            <span v-if="addedBy">Added by: {{ addedBy }}</span>
                                        </v-card>
                                    </v-col>
                                </v-row>
                                <v-row align="center" class="ma-0 pa-0 mt-4" justify="center">
                                    <v-col class="ma-0 pa-0 text-center" cols="2">
                                        {{ songProgressString }}
                                    </v-col>
                                    <v-col class="ma-0 pa-0 text-center" cols="8">
                                        <v-progress-linear :color="progressColour" :value="songProgress * 100"
                                                           class="ma-0 pa-0"
                                                           height="10"></v-progress-linear>
                                    </v-col>
                                    <v-col class="ma-0 pa-0 text-center" cols="2">
                                        {{ songDurationString }}
                                    </v-col>
                                </v-row>
                            </v-container>
                        </v-card>
                    </v-row>
                </v-col>
            </v-container>
            <v-container class="ma-0 pa-0 fill-height" fluid v-else>
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
            <v-snackbar :timeout="2000" absolute bottom v-model="snackbarState">
                {{ snackbarMessage }}
                <v-btn @click="snackbarAction" color="blue" text>
                    {{ snackbarButton }}
                </v-btn>
            </v-snackbar>
        </template>
        <template v-slot:append>
            <v-container class="ma-0 pa-0 mb-10" fluid>
                <v-row align="center" class="ma-0 pa-0" justify="center">
                    <v-col class="ma-0 pa-0" cols="12" lg="4" md="10" sm="12">
                        <v-row align="center" class="ma-0 pa-0" justify="center">
                            <v-col cols="6">
                                <v-row align="center" class="ma-0 pa-0" justify="center">
                                    <queue :playlist="playlist"
                                           :playlistId="playlistId"
                                           @dialog="handleDialog"
                                           @downvote="downvoteSong"
                                           @upvote="upvoteSong"
                                           ref="queue"/>
                                </v-row>
                            </v-col>
                            <v-col cols="6">
                                <v-row align="center" class="ma-0 pa-0" justify="center">
                                    <add @add="addItem"
                                         @dialog="handleDialog"
                                         @search="search"
                                         ref="add"/>
                                </v-row>
                            </v-col>
                        </v-row>
                    </v-col>
                </v-row>
            </v-container>
        </template>
    </v-navigation-drawer>
</template>

<script>
    import io from 'socket.io-client'
    import Queue from './DialogQueue'
    import Add from './DialogAdd'
    import AppShareDialog from "./ShareDialog";
    import * as dayjs from 'dayjs'
    import AppAdminDialog from "./AdminDialog";
    import AppCurrentArtworkDialog from "./AlbumArtworkDialog";

    export default {
        name: "Home",
        data: () => ({
            hasState: false,
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
            addedBy: '',
            openDialogs: [],
            safetyDialog: false,
            safeToLeave: false,
            overlay: false,
            snackbarState: false,
            snackbarMessage: '',
            snackbarButton: '',
            snackbarAction: () => {
            },
            searchResult: {},
            isPlaying: false,
            isAdmin: false,
            backgroundString: '',
            progressColour: '',
            albumArtworkDialog: false,
            songProgressLoopTrack: null,
            songProgress: 0,
            songDuration: 0,
            songAnalysis: null,
            notificationPermission: null,
            media: null,
            mediaSessionLoop: null
        }),
        components: {
            AppCurrentArtworkDialog,
            AppAdminDialog,
            AppShareDialog,
            'queue': Queue,
            'add': Add
        },
        computed: {
            songProgressString() {
                return `${Math.floor((((this.songProgress) * this.songDuration) / 1000) /
                    60)}:${this.numberPadding(Math.floor((((this.songProgress) * this.songDuration) / 1000) -
                    (Math.floor((((this.songProgress) * this.songDuration) / 1000) / 60) * 60)))}`
            },
            songDurationString() {
                return `${Math.floor((this.songDuration / 1000) / 60)}:${this.numberPadding(Math.floor((this.songDuration / 1000) -
                    (Math.floor((this.songDuration / 1000) / 60) * 60)))}`;
            },
            songStats() {
                const allowed = ['energy', 'danceability', 'liveness', 'speechiness', 'instrumentalness', 'valance']
                return Object.keys(this.songAnalysis)
                    .filter(e => allowed.includes(e))
                    .map(e => ({
                        name: e,
                        value: this.songAnalysis[e]
                    }));
            }
        },
        methods: {
            numberPadding(number) {
                return `${number < 10 ? '0' : ''}${number}`
            },
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
            handleEvent(e) {
                console.log(e);
                this.socket.emit(e.eventName, {
                    token: this.token,
                    data: e.data
                });
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
            downvoteSong(playlistEntryId) {
                this.socket.emit('playlist-downvote-song', {
                    token: this.token,
                    data: {playlistEntryId}
                });
            },
            upvoteSong(playlistEntryId) {
                this.socket.emit('playlist-upvote-song', {
                    token: this.token,
                    data: {playlistEntryId}
                });
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
                this.socket.emit('user-admin', {
                    token: this.token,
                    data: null
                })
            },
            gotStateData(data) {
                this.isLoading = false;
                if (data.playstate) {
                    this.hasState = true;
                    this.isPlaying = data.playstate.isPlaying;
                    this.trackName = data.playstate.trackName;
                    this.albumArtwork = data.playstate.albumArtwork;
                    this.artistName = data.playstate.artistName;
                    this.trackId = data.playstate.trackId;
                    this.addedBy = data.playstate.addedBy;
                    let lv = data.playstate.colours.lightVibrant;
                    let v = data.playstate.colours.vibrant;
                    this.backgroundString = `background-image: linear-gradient(#${lv}ff 0%, rgba(0,0,0,1) 100%);`;
                    this.progressColour = `#${v}`;
                    this.songProgress = data.playstate.progress / data.playstate.duration;
                    this.songDuration = data.playstate.duration;
                    this.songAnalysis = data.playstate.analysis;
                    this.updateMediaMetadata();
                    clearInterval(this.songProgressLoopTrack);
                    if (this.isPlaying) {
                        const finishTime = dayjs().add((data.playstate.duration - data.playstate.progress), 'milliseconds').valueOf();
                        this.songProgressLoopTrack = setInterval(() => {
                            const progress = (1 - ((finishTime - dayjs().valueOf()) / data.playstate.duration));
                            this.songProgress = progress <= 1 && progress >= 0 ? progress : 0;
                        }, 100);

                    }
                } else {
                    this.isPlaying = false;
                    this.hasState = false;
                    this.backgroundString = `background-image: linear-gradient(#000000ff 0%, rgba(0,0,0,1) 100%);`;
                    navigator.mediaSession.playbackState = "paused";
                }
                if (data.party) {
                    this.code = data.party.code;
                }
            },
            updateMediaMetadata() {
                if (this.isPlaying) {
                    navigator.mediaSession.playbackState = "playing";
                    if (this.audio) {
                        this.audio.play();
                    }
                } else {
                    navigator.mediaSession.playbackState = "paused";
                    if (this.audio) {
                        this.audio.pause();
                    }
                }
                navigator.mediaSession.setPositionState({
                    duration: Math.floor(this.songDuration / 1000),
                    playbackRate: 1,
                    position: Math.floor((this.songDuration * this.songProgress) / 1000)
                });
                navigator.mediaSession.metadata = new MediaMetadata({
                    title: this.trackName,
                    artist: this.artistName,
                    artwork: [
                        {src: this.albumArtwork, sizes: '512x512', type: 'image/png'},
                    ]
                });
            },
            addMediaView() {
                if ('mediaSession' in navigator) {
                    this.audio = document.createElement('audio');
                    this.audio.src = "https://raw.githubusercontent.com/anars/blank-audio/master/10-seconds-of-silence.mp3";
                    this.audio.loop = true;
                    this.audio.play().then(() => {
                        this.updateMediaMetadata();
                        navigator.mediaSession.setActionHandler('pause', () => {
                            this.socket.emit('party-playback-toggle', {
                                token: this.token,
                                data: {}
                            });
                        });
                        navigator.mediaSession.setActionHandler('play', () => {
                            this.socket.emit('party-playback-toggle', {
                                token: this.token,
                                data: {}
                            });
                        });
                        navigator.mediaSession.setActionHandler('nexttrack', () => {
                            this.socket.emit('party-playback-next', {
                                token: this.token,
                                data: {}
                            });
                        });
                    });
                }
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
            if (!('Notification' in window)) {
                console.log("This browser does not support notifications.");
            } else {
                Notification.requestPermission().then((permission) => {
                    this.notificationPermission = permission;
                });
            }
            if (!('serviceWorker' in navigator)) {
                console.log("This browser does not support service workers.");
            } else {
                navigator.serviceWorker.register('/sw.js?c=4654654');
            }
            window.scrollTo(0, 0);
            this.token = localStorage.getItem('token');
            this.socket = io(this.$socketUrl);
            this.socket.on('connect', () => {
                this.requestStateData();
                this.socket.emit('join', {token: this.token, data: null});
            });
            this.socket.on('reload', () => {
                location.reload();
            });
            this.socket.on('party-leave', () => {
                this.navigateAway();
            });
            this.socket.on('notification', (data) => {
                if (this.notificationPermission === 'granted') {
                    navigator.serviceWorker.getRegistration().then((reg) => {
                        const options = {
                            body: `${data.body}`,
                            icon: '/assets/apple-touch-icon.png',
                            badge: '/assets/mstile-144x144.png',
                            vibrate: [200, 100],
                            data: {dateOfArrival: dayjs().valueOf()},
                            actions: data.actions
                        };
                        reg.showNotification(`${data.title}`, options);
                    });
                }
            });
            this.socket.on('user-admin', (data) => {
                this.isAdmin = data.admin;
            });
            this.socket.on('party-state', this.gotStateData);
            this.socket.on('state-change', this.gotStateData);
            this.socket.on('playlist-state', (data) => {
                this.playlist = data.playlist;
            });
            this.socket.on('playlist-update', (data) => {
                this.playlist = data.playlist;
            });
            this.socket.on('search-success', (message) => {
                this.searchResult = message.data;
                this.$refs.add.$refs.search.gotResult(message.data);
            });
        }
    }
</script>