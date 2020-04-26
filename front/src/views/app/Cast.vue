<template>
    <v-content :style="backgroundString" class="fill-height ma-0 pt-0">
        <v-app-bar class="elevation-0" color="black" fixed height="100">
            <v-container class="ma-0 pa-0" fluid>
                <v-row align="center" class="ma-0 pa-0" justify="center">
                    <v-col class="ma-0 pa-0" cols="4">
                        <v-row class="ma-0 pa-0">
                            <v-icon color="primary" x-large>mdi-music-note-plus</v-icon>
                            <v-toolbar-title class="display-2 text-uppercase ml-6">
                                <span>Up</span>
                                <span class="font-weight-light">Next</span>
                            </v-toolbar-title>
                        </v-row>
                    </v-col>
                    <v-col class="ma-0 pa-0" cols="4">
                        <v-row align="center" class="ma-0 pa-0" justify="center">
                            <span class="display-1">{{ partyName }}</span>
                        </v-row>
                    </v-col>
                    <v-col class="ma-0 pa-0" cols="4">
                        <v-row align="center" class="ma-0 pa-0" justify="end">
                            <span class="text-uppercase display-2"
                                  style="letter-spacing: 0.25em !important;font-family: monospace !important;">{{ code }}</span>
                        </v-row>
                    </v-col>
                </v-row>
            </v-container>
        </v-app-bar>
        <v-container class="fill-height ma-0 pa-0" fluid v-if="hasState">
            <v-overlay :value="isLoading" absolute opacity="0.7">
                <v-progress-circular color="primary" indeterminate size="200" width="15"></v-progress-circular>
            </v-overlay>
            <v-row align="center" class="ma-0 pa-0" justify="center">
                <v-col class="ma-0 pa-0 pl-5" cols="4">
                    <v-row align="center" class="ma-0 pa-0" justify="start">
                        <v-img :src="albumArtwork" class="mt-10 mb-5 elevation-20" max-width="600"
                               min-height="300"></v-img>
                    </v-row>
                    <v-row align="center" class="ma-0 pa-0" justify="start">
                        <v-col class="ma-0 pa-0 ml-4" cols="12">
                            <v-row class="ma-0 pa-0">
                                <h1 class="display-3 font-weight-bold text-left"
                                    style="height: 1.2em; text-overflow: ellipsis;white-space: nowrap;overflow: hidden;">
                                    {{ trackName }}</h1>
                            </v-row>
                            <v-row class="ma-0 pa-0">
                                <h1 class="display-2 font-weight-thin text-left "
                                    style="height: 1.2em; text-overflow: ellipsis;white-space: nowrap;overflow: hidden;">
                                    {{ artistName }}</h1>
                            </v-row>
                            <v-row class="ma-0 pa-0">
                                <h1 class="heading font-weight-regular text-left" v-if="addedBy"
                                    style="height: 1.2em; text-overflow: ellipsis;white-space: nowrap;overflow: hidden;">
                                    Added By: {{ addedBy }}
                                </h1>
                            </v-row>
                        </v-col>
                    </v-row>
                </v-col>
                <v-col class="ma-0 pa-0 mt-10 pr-5" cols="8">
                    <v-container class="ma-0 pa-0 mt-10" fluid>
                        <v-row align="center" class="ma-0 pa-0 mt-10" justify="center">
                            <v-col class="ma-0 pa-0" cols="6">
                                <v-card class="ma-0 pa-0 mt-5 elevation-0" color="transparent" height="600">
                                    <v-container class="ma-0 pa-0 fill-height" fluid>
                                        <v-col cols="12">
                                            <v-row align="center" class="ma-0 pa-0" justify="center">
                                                <v-card :color="`#${qrFront}`" class="text-left" width="400">
                                                    <h1 class="display-2 ma-4 ml-6">Scoreboard</h1>
                                                    <v-divider dark></v-divider>
                                                    <v-list color="transparent">
                                                        <v-list-item :key="`${i}${e.score}${e.id}`"
                                                                     v-for="(e, i) in users.slice(0, 6)">
                                                            <v-list-item-avatar>
                                                                <h1 class="display-2 font-weight-bold">{{i+1}}</h1>
                                                            </v-list-item-avatar>
                                                            <v-list-item-content>
                                                                <v-list-item-title>
                                                                    <h1 class="display-1">{{e.name}}</h1>
                                                                </v-list-item-title>
                                                            </v-list-item-content>
                                                            <v-list-item-action>
                                                                <h1 class="display-1 font-weight-bold">{{e.score}}</h1>
                                                            </v-list-item-action>
                                                        </v-list-item>
                                                    </v-list>
                                                </v-card>
                                            </v-row>
                                        </v-col>
                                    </v-container>
                                </v-card>
                            </v-col>
                            <v-col class="ma-0 pa-0" cols="6">
                                <v-card class="ma-0 pa-0 mt-5 elevation-0" color="transparent" height="600">
                                    <v-container class="ma-0 pa-0 fill-height" fluid>
                                        <v-col cols="12">
                                            <v-row align="center" class="ma-0 pa-0" justify="center">
                                                <v-img :src="`${$apiUrl}/party/qr.png?code=${code}&back=${qrBack}&front=${qrFront}`"
                                                       class="elevation-0" max-width="400"
                                                       v-if="qrFront !== ''"></v-img>
                                            </v-row>
                                        </v-col>
                                    </v-container>
                                </v-card>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col class="ma-0 pa-0" cols="12">
                                <v-row class="ma-0 pa-0 mt-4 ml-3 pl-8">
                                    <v-card class="ma-o pa-0 elevation-0" color="transparent" height="190"
                                            width="0"></v-card>
                                    <v-card :key="`${i}${e}`"
                                            class="mr-5 text-left elevation-0"
                                            color="transparent"
                                            tile
                                            v-for="(e, i) in playlist.slice(0, 6)"
                                            width="150"
                                    >
                                        <v-img :src="e.albumArtwork" class="elevation-10 mb-1" height="100"
                                               v-if="e.albumArtwork"
                                               position="center">
                                            <v-overlay absolute opacity="0.7">
                                                <h1 class="display-3 font-weight-bold">{{ e.UpVotes - e.DownVotes
                                                    }}</h1>
                                            </v-overlay>
                                        </v-img>
                                        <div class="font-weight-bold"
                                             style="text-overflow: ellipsis;white-space: nowrap;overflow: hidden;">
                                            {{ e.name}}
                                        </div>
                                        <div class="font-weight-thin"
                                             style="text-overflow: ellipsis;white-space: nowrap;overflow: hidden;">
                                            {{ e.artist }}
                                        </div>
                                        <div style="text-overflow: ellipsis;white-space: nowrap;overflow: hidden;">
                                            + {{ e.addedBy }}
                                        </div>
                                    </v-card>
                                </v-row>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-col>
            </v-row>
        </v-container>
        <v-container class="ma-0 pa-0 mb-12 fill-height" fluid v-else>
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
        <v-footer class="ma-0 pa-0 elevation-0" fixed>
            <v-progress-linear :color="progressColour" :value="songProgress" class="ma-0 pa-0"
                               height="30"></v-progress-linear>
        </v-footer>
    </v-content>
</template>

<script>

    import io from 'socket.io-client';
    import session from 'localStorage';
    import moment from 'moment';

    export default {
        name: "Cast",
        data: () => ({
            hasState: false,
            isLoading: true,
            eventLoop: null,
            backgroundString: '',
            progressColour: '',
            albumArtwork: '',
            trackName: '',
            artistName: '',
            songProgress: 0,
            trackId: '',
            partyName: '',
            code: '',
            addedBy: '',
            playlist: [],
            playlistId: '',
            songProgressLoopTrack: null,
            qrBack: '',
            qrFront: '',
            users: []
        }),
        mounted() {
            window.scrollTo(0, 0);
            this.token = session.getItem('token');
            this.socket = io(this.$socketUrl);
            this.socket.on('connect', () => {
                this.requestStateData();
                this.socket.emit('join', {token: this.token, data: null});
            });
            this.socket.on('party-leave', () => {
                this.navigateAway();
            });
            this.socket.on('party-state', (data) => {
                this.isLoading = false;
                if (data.playstate) {
                    this.hasState = true;
                    this.trackName = data.playstate.trackName;
                    this.albumArtwork = data.playstate.albumArtwork;
                    this.artistName = data.playstate.artistName;
                    this.trackId = data.playstate.trackId;
                    this.addedBy = data.playstate.addedBy;
                    let lv = data.playstate.colours.lightVibrant;
                    let v = data.playstate.colours.vibrant;
                    let dv = data.playstate.colours.darkVibrant;
                    let lm = data.playstate.colours.lightVibrant;
                    this.backgroundString = `background-image: linear-gradient(#${lv}ff 0%, rgba(0,0,0,1) 100%);`;
                    this.progressColour = `#${v}`;
                    this.qrBack = encodeURI(`${lm}`);
                    this.qrFront = encodeURI(`${dv}`);
                    this.songProgress = data.playstate.progress / data.playstate.duration * 100;
                    clearInterval(this.songProgressLoopTrack);
                    if (data.playstate.isPlaying) {
                        const finishTime = moment().add((data.playstate.duration - data.playstate.progress), 'milliseconds').valueOf();
                        this.songProgressLoopTrack = setInterval(() => {
                            const progress = (1 - ((finishTime - moment().valueOf()) / data.playstate.duration)) * 100;
                            this.songProgress = progress <= 100 && progress >= 0 ? progress : 0;
                        }, 100);
                    }
                } else {
                    this.hasState = false;
                    this.songProgress = 0;
                    clearInterval(this.songProgressLoopTrack);
                    this.backgroundString = `background-image: linear-gradient(#000000ff 0%, rgba(0,0,0,1) 100%);`;
                    this.progressColour = `primary`;
                }
                if (data.party) {
                    this.code = data.party.code;
                    this.partyName = data.party.name;
                }
            });
            this.socket.on('playlist-state', (data) => {
                this.playlist = data.playlist;
            });
            this.socket.on('state-change', (data) => {
                this.isLoading = false;
                if (data.playstate) {
                    this.hasState = true;
                    this.trackName = data.playstate.trackName;
                    this.albumArtwork = data.playstate.albumArtwork;
                    this.artistName = data.playstate.artistName;
                    this.trackId = data.playstate.trackId;
                    this.addedBy = data.playstate.addedBy;
                    let lv = data.playstate.colours.lightVibrant;
                    let v = data.playstate.colours.vibrant;
                    let dv = data.playstate.colours.darkVibrant;
                    let lm = data.playstate.colours.lightVibrant;
                    this.backgroundString = `background-image: linear-gradient(#${lv}ff 0%, rgba(0,0,0,1) 100%);`;
                    this.progressColour = `#${v}`;
                    this.qrBack = encodeURI(`${lm}`);
                    this.qrFront = encodeURI(`${dv}`);
                    this.songProgress = data.playstate.progress / data.playstate.duration * 100;
                    clearInterval(this.songProgressLoopTrack);
                    if (data.playstate.isPlaying) {
                        const finishTime = moment().add((data.playstate.duration - data.playstate.progress), 'milliseconds').valueOf();
                        this.songProgressLoopTrack = setInterval(() => {
                            const progress = (1 - ((finishTime - moment().valueOf()) / data.playstate.duration)) * 100;
                            this.songProgress = progress <= 100 && progress >= 0 ? progress : 0;
                        }, 100);
                    }
                } else {
                    this.hasState = false;
                    this.songProgress = 0;
                    clearInterval(this.songProgressLoopTrack);
                    this.backgroundString = `background-image: linear-gradient(#000000ff 0%, rgba(0,0,0,1) 100%);`;
                    this.progressColour = `primary`;
                }
                if (data.party) {
                    this.code = data.party.code;
                    this.partyName = data.party.name;
                }
            });
            this.socket.on('playlist-update', (data) => {
                this.playlist = data.playlist;
            });
        },
        beforeDestroy() {
            this.socket.disconnect();
        },
        methods: {
            navigateAway() {
                this.safeToLeave = true;
                this.$router.push('/leave');
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
        }
    }
</script>