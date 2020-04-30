<template>
    <v-dialog fullscreen v-model="dialog">
        <template v-slot:activator="{ on }">
            <v-lazy :options="{threshold: .5}"
                    min-height="73"
                    transition="fade-transition"
                    v-model="isActive">
                <div>
                    <v-list-item @click="open">
                        <v-list-item-avatar tile>
                            <v-img :src="artwork" size="60"/>
                        </v-list-item-avatar>
                        <v-list-item-content>
                            <v-list-item-title style="text-overflow: ellipsis;white-space: nowrap;overflow: hidden;">
                                {{ name }}
                            </v-list-item-title>
                            <v-list-item-subtitle style="text-overflow: ellipsis;white-space: nowrap;overflow: hidden;">
                                {{ artists }}
                            </v-list-item-subtitle>
                        </v-list-item-content>
                    </v-list-item>
                    <v-divider dark></v-divider>
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
                <v-container class="ma-0 pa-0" fluid v-if="albumData">
                    <v-col class="ma-0 pa-0" cols="12">
                        <v-row align="center" class="ma-0 pa-0" justify="center">
                            <album-artwork :src="albumArtwork"></album-artwork>
                        </v-row>
                        <v-row align="center" class="ma-0 pa-0 mt-3 mx-5" justify="center">
                            <h1 class="headline">{{ albumName }}</h1>
                        </v-row>
                        <v-row align="center" class="ma-0 pa-0" justify="center">
                            <h1 class="subtitle-1 font-italic font-weight-thin">
                                {{ albumArtists.map(e => e.name).join(',') }}
                            </h1>
                        </v-row>
                    </v-col>
                    <v-list class="ma-0 pa-0" color="transparent" two-line>
                        <song
                                :artist="item.artists.map(e => e.name).join(', ')"
                                :id="item.id"
                                :key="index"
                                :name="item.name"
                                @add="addItem"
                                v-for="(item, index) in albumTracks">
                        </song>
                    </v-list>
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
    import session from 'localStorage'
    import axios from 'axios'
    import AlbumArtwork from "./AlbumArtwork";
    import Song from "./Song";
    import Artist from "./Artist";

    export default {
        props: ['socket', 'id', 'name', 'artists', 'artwork'],
        name: "album",
        data: () => ({
            isActive: false,
            dialog: false,
            token: '',
            albumData: null
        }),
        components: {
            'song': () => import('./Song.vue'),
            'album-artwork': () => import('./AlbumArtwork.vue'),
        },
        computed: {
            albumArtwork() {
                return this.albumData.images.filter(e => e.width === Math.max(...this.albumData.images.map(e => e.width)))[0].url
            },
            albumName() {
                return this.albumData.name;
            },
            albumArtists() {
                return this.albumData.artists;
            },
            albumTracks() {
                return this.albumData.tracks.items;
            }
        },
        mounted() {
            this.token = session.getItem('token');
            this.socket.on(`spotify-album-${this.id}`, ({album}) => {
                this.albumData = album;
            });
        },
        methods: {
            open() {
                this.dialog = true;
                this.socket.emit('spotify-album', {
                    token: localStorage.getItem('token'),
                    data: {
                        albumId: this.id
                    }
                });
                this.handleDialog({state: 'open', id: 'album', close: this.close});
            },
            close() {
                this.dialog = false;
                this.handleDialog({
                    state: 'close',
                    id: 'album'
                });
                this.albumData = null;
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
