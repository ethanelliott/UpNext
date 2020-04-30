<template>
    <v-dialog fullscreen v-model="dialog">
        <template v-slot:activator="{ on }">
            <v-lazy :options="{threshold: .5}"
                    min-height="56"
                    transition="fade-transition"
                    v-model="isActive">
                <div>
                    <v-list-item @click="open">
                        <v-list-item-avatar tile>
                            <v-img :src="artwork" size="60" v-if="artwork"/>
                            <v-icon v-else>mdi-artist</v-icon>
                        </v-list-item-avatar>
                        <v-list-item-content>
                            <v-list-item-title>{{ name }}</v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                    <v-divider dark></v-divider>
                </div>
            </v-lazy>
        </template>
        <v-card color="darker">
            <transition mode="out-in" name="fade">
                <v-container class="ma-0 pa-0" fluid v-if="artistData">
                    <v-row class="ma-0 pa-0">
                        <v-col class="ma-0 pa-0" cols="12">
                            <v-img :src="artistImage"
                                   gradient="#121212aa 0%, #00000000 20%, #00000000 60%, #121212ff 100%" height="300"
                                   max-height="300" position="center">
                                <v-btn @click="close" absolute dark icon right top>
                                    <v-icon>mdi-close</v-icon>
                                </v-btn>
                            </v-img>
                        </v-col>
                    </v-row>
                    <v-row class="ma-0 pa-0">
                        <v-col class="ma-0 pa-0" cols="12">
                            <v-progress-linear :value="artistPopularity" height="1"></v-progress-linear>
                        </v-col>
                    </v-row>
                    <v-row class="ma-0 pa-0">
                        <v-col class="ma-0 pa-0" cols="12">
                            <h1 class="display-1 ml-5 mt-5">{{ artistName }}</h1>
                        </v-col>
                    </v-row>
                    <v-row class="ma-0 pa-0">
                        <v-col class="ma-0 pa-0" cols="12">
                            <h1 class="subtitle-2 ml-5 font-weight-thin font-italic">{{ artistFollowers }}
                                FOLLOWERS</h1>
                        </v-col>
                    </v-row>
                    <v-row align="center" class="ma-0 pa-0 mt-5" justify="center" v-if="!active.top">
                        <v-progress-circular color="primary" indeterminate size="50" width="3"></v-progress-circular>
                    </v-row>
                    <v-lazy :options="{threshold: .25}"
                            min-height="100"
                            transition="fade-transition"
                            v-model="active.top">
                        <v-row class="ma-0 pa-0">
                            <v-col class="ma-0 pa-0" cols="12">
                                <h1 class="headline ml-5 mt-5">Top Songs</h1>
                                <v-list class="ma-0 pa-0" color="transparent" two-line>
                                    <song
                                            :artist="item.artists.map(e => e.name).join(', ')"
                                            :artwork="item.album.images && item.album.images.length > 0 ? item.album.images.filter(e => e.width === Math.min(...item.album.images.map(j => j.width)))[0].url : ''"
                                            :id="item.id"
                                            :key="index"
                                            :name="item.name"
                                            @add="addItem"
                                            v-for="(item, index) in topTracks.tracks.slice(0, 5)">
                                    </song>
                                </v-list>
                            </v-col>
                        </v-row>
                    </v-lazy>
                    <v-row align="center" class="ma-0 pa-0 mt-5" justify="center" v-if="!active.albums">
                        <v-progress-circular color="primary" indeterminate size="50" width="3"></v-progress-circular>
                    </v-row>
                    <v-lazy :options="{threshold: .05}"
                            min-height="100"
                            transition="fade-transition"
                            v-model="active.albums">
                        <v-row class="ma-0 pa-0">
                            <v-col class="ma-0 pa-0" cols="12">
                                <h1 class="headline ml-5 mt-5">Albums</h1>
                                <v-list class="ma-0 pa-0" color="transparent" two-line>
                                    <album
                                            :artists="item.artists.map(e => e.name).join(', ')"
                                            :artwork="item.images && item.images.length > 0 ? item.images.filter(e => e.width === Math.min(...item.images.map(j => j.width)))[0].url : null"
                                            :id="item.id"
                                            :key="index"
                                            :name="item.name"
                                            :socket="socket"
                                            @add="addItem"
                                            @dialog="handleDialog"
                                            v-for="(item, index) in artistAlbums">
                                    </album>
                                </v-list>
                            </v-col>
                        </v-row>
                    </v-lazy>
                    <v-row align="center" class="ma-0 pa-0 mt-5" justify="center" v-if="!active.singles">
                        <v-progress-circular color="primary" indeterminate size="50" width="3"></v-progress-circular>
                    </v-row>
                    <v-lazy :options="{threshold: .05}"
                            min-height="100"
                            transition="fade-transition"
                            v-model="active.singles">
                        <v-row class="ma-0 pa-0">
                            <v-col class="ma-0 pa-0" cols="12">
                                <h1 class="headline ml-5 mt-5">Singles</h1>
                                <v-list class="ma-0 pa-0" color="transparent" two-line>
                                    <album
                                            :artists="item.artists.map(e => e.name).join(', ')"
                                            :artwork="item.images.length > 0 ? item.images.filter(e => e.width === Math.min(...item.images.map(j => j.width)))[0].url : null"
                                            :id="item.id"
                                            :key="index"
                                            :name="item.name"
                                            :socket="socket"
                                            @add="addItem"
                                            @dialog="handleDialog"
                                            v-for="(item, index) in artistSingles">
                                    </album>
                                </v-list>
                            </v-col>
                        </v-row>
                    </v-lazy>
                </v-container>
                <v-container class="fill-height ma-0 pa-0" fluid v-else>
                    <v-toolbar color="darker" fixed flat>
                        <v-spacer/>
                        <v-btn @click="close" icon>
                            <v-icon>mdi-close</v-icon>
                        </v-btn>
                    </v-toolbar>
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
    import session from 'localStorage';
    import axios from 'axios';

    export default {
        props: ['socket', 'id', 'name', 'artwork'],
        name: "artist",
        data: () => ({
            isActive: false,
            dialog: false,
            token: '',
            artistData: null,
            topTracks: null,
            albums: null,
            active: {
                top: false,
                albums: false,
                singles: false
            },
        }),
        components: {
            'album': () => import('./Album.vue'),
            'song': () => import('./Song.vue'),
        },
        computed: {
            artistImage() {
                return this.artistData.images.length > 0 ? this.artistData.images.filter(e => e.width === Math.max(...this.artistData.images.map(j => j.width)))[0].url : ''
            },
            artistName() {
                return this.artistData.name;
            },
            artistFollowers() {
                return this.artistData.followers.total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            },
            artistPopularity() {
                return this.artistData.popularity;
            },
            artistAlbums() {
                return this.albums.filter(e => e.album_type === 'album');
            },
            artistSingles() {
                return this.albums.filter(e => e.album_type === 'single');
            }
        },
        mounted() {
            this.token = session.getItem('token');
            this.socket.on(`spotify-artist-${this.id}`, ({artist, albums, topTracks}) => {
                this.artistData = artist;
                this.topTracks = topTracks;
                this.albums = albums;
            });
        },
        methods: {
            open() {
                this.dialog = true;
                this.socket.emit('spotify-artist', {
                    token: localStorage.getItem('token'),
                    data: {
                        artistId: this.id
                    }
                });
                this.handleDialog({
                    state: 'open',
                    id: 'artist',
                    close: this.close
                });
            },
            close() {
                this.dialog = false;
                this.handleDialog({
                    state: 'close',
                    id: 'artist'
                });
                this.artistData = null;
                this.topTracks = null;
                Object.keys(this.active).forEach(e => {
                    this.active[e] = false;
                })
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
