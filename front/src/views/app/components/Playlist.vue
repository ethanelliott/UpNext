<template>
    <v-dialog fullscreen hide-overlay transition="dialog-bottom-transition" v-model="dialog">
        <template v-slot:activator="{ on }">
            <v-lazy :options="{threshold: .5}"
                    min-height="56"
                    transition="fade-transition"
                    v-model="isActive">
                <div>
                    <v-list-item @click="open">
                        <v-list-item-avatar tile>
                            <v-img :src="artwork" size="60"/>
                        </v-list-item-avatar>
                        <v-list-item-content>
                            <v-list-item-title>{{ name }}</v-list-item-title>
                            <v-list-item-subtitle>{{ creator }}</v-list-item-subtitle>
                        </v-list-item-content>
                    </v-list-item>
                </div>
            </v-lazy>
        </template>
        <v-card color="darker">
            <v-toolbar color="darker" fixed flat>
                <v-spacer/>
                <v-btn @click="close" icon>
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-toolbar>
            <transition mode="out-in" name="fade">
                <v-container class="ma-0 pa-0" fluid v-if="playlistData">
                    <v-col class="ma-0 pa-0" cols="12">
                        <v-row align="center" class="ma-0 pa-0" justify="center">
                            <album-artwork :src="playlistArtwork"></album-artwork>
                        </v-row>
                        <v-row align="center" class="ma-0 pa-0 mt-3 mx-5" justify="center">
                            <h1 class="headline">{{ playlistName }}</h1>
                        </v-row>
                        <v-row align="center" class="ma-0 pa-0 mx-5" justify="center">
                            <h1 class="subtitle-1 font-italic font-weight-thin">{{ playlistDescription }}</h1>
                        </v-row>
                        <v-row align="center" class="ma-0 pa-0" justify="center">
                            <h1 class="subtitle-2 font-weight-thin">{{ playlistLength }} tracks - {{ playlistFollowers
                                }} followers - By {{ playlistOwner }}</h1>
                        </v-row>
                    </v-col>
                    <v-list class="ma-0 pa-0 mt-5" color="transparent" two-line>
                        <song
                                :artist="item.artists.map(e => e.name).join(', ')"
                                :artwork="item.album.images && item.album.images.length > 0 ? item.album.images.filter(e => e.width === Math.min(...item.album.images.map(j => j.width)))[0].url : ''"
                                :id="item.id"
                                :key="index"
                                :name="item.name"
                                @add="addItem"
                                v-for="(item, index) in tracks">
                        </song>
                    </v-list>
                    <v-lazy :options="{threshold: .05}"
                            min-height="100"
                            transition="fade-transition"
                            v-model="endOfScrollTracker">
                        <v-container class="fill-height ma-0 pa-0" fluid v-if="endOfScrollLoader">
                            <v-col class="ma-0 pa-0" cols="12"></v-col>
                            <v-row align="center" class="ma-0 pa-0 mt-5" justify="center">
                                <v-progress-circular color="primary" indeterminate size="50"
                                                     width="5"></v-progress-circular>
                            </v-row>
                        </v-container>
                    </v-lazy>
                </v-container>
                <v-container class="fill-height ma-0 pa-0" fluid v-else>
                    <v-card color="transparent" elevation="0" height="200" width="100%"></v-card>
                    <v-col class="ma-0 pa-0" cols="12">
                        <v-row align="center" class="ma-0 pa-0" justify="center">
                            <v-progress-circular color="primary" indeterminate size="150"
                                                 width="5"></v-progress-circular>
                        </v-row>
                    </v-col>
                </v-container>
            </transition>
        </v-card>
    </v-dialog>
</template>

<script>
    import axios from 'axios'
    import Song from "./Song";
    import AlbumArtwork from "./AlbumArtwork";
    // import Song from './Song'

    export default {
        props: ['socket', 'id', 'name', 'artwork', 'creator'],
        name: "playlist",
        data: () => ({
            isActive: false,
            dialog: false,
            token: '',
            playlistData: null,
            playlistTracks: [],
            endOfScrollTracker: false,
            endOfScrollLoader: true
        }),
        components: {
            AlbumArtwork,
            Song
        },
        mounted() {
            this.token = localStorage.getItem('token');
            this.socket.on(`spotify-playlist-${this.id}`, ({playlist, tracks}) => {
                this.playlistData = playlist;
                this.playlistTracks.push(...tracks.items);
                this.endOfScrollTracker = false;
            });
        },
        computed: {
            tracks() {
                return this.playlistTracks.filter(e => e.track && e.track.type === 'track').map(e => e.track);
            },
            playlistArtwork() {
                return this.playlistData.images && this.playlistData.images.length > 0 ? this.playlistData.images[0].url : '';
            },
            playlistName() {
                return this.playlistData.name;
            },
            playlistDescription() {
                return this.playlistData.description;
            },
            playlistFollowers() {
                return this.playlistData.followers.total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            },
            playlistOwner() {
                return this.playlistData.owner.display_name;
            },
            playlistLength() {
                return this.playlistData.tracks.total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            }
        },
        watch: {
            endOfScrollTracker(val) {
                if (val === true) {
                    if (this.playlistTracks.length < this.playlistData.tracks.total) {
                        this.socket.emit('spotify-playlist', {
                            token: localStorage.getItem('token'),
                            data: {
                                playlistId: this.id,
                                offset: this.playlistTracks.length,
                                limit: 100,
                            }
                        });
                        this.endOfScrollLoader = true;
                    } else {
                        this.endOfScrollLoader = false;
                    }
                }
            }
        },
        methods: {
            open() {
                this.dialog = true;
                this.socket.emit('spotify-playlist', {
                    token: localStorage.getItem('token'),
                    data: {
                        playlistId: this.id,
                        offset: 0,
                        limit: 100,
                    }
                });
                this.handleDialog({
                    state: 'open',
                    id: 'playlist',
                    close: this.close
                });
            },
            close() {
                this.dialog = false;
                this.playlistData = null;
                this.handleDialog({
                    state: 'close',
                    id: 'playlist'
                });
            },
            addItem(songId) {
                this.$emit('add', songId)
            },
            handleDialog(state) {
                this.$emit('dialog', state)
            }
        },
    }
</script>
