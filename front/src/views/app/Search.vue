<template>
    <v-card class="text-left pa-0 ma-0" color="transparent" elevation="0">
        <v-app-bar class="ma-0 pa-0" color="darker" extended fixed>
            <v-text-field @input="isTypingSearch = true" autocomplete="off" autofocus
                          full-width hide-details label="search for something"
                          prepend-inner-icon="mdi-magnify" single-line v-model="query"/>
            <v-btn dark icon to="/app/home">
                <v-icon>mdi-close</v-icon>
            </v-btn>
            <v-tabs background-color="transparent" fixed-tabs slot="extension" v-model="tabs">
                <v-tab>Songs</v-tab>
                <v-tab>Albums</v-tab>
                <v-tab>Artists</v-tab>
                <v-tab>Playlists</v-tab>
            </v-tabs>
        </v-app-bar>
        <v-container class="ma-0 pa-0 mt-10 pa-0 pt-6" fluid v-if="emptySearch">
            <v-card color="transparent" elevation="0" height="104" width="100%"></v-card>
            <v-row class="ma-0 pa-0">
                <v-col align="center" class="ma-0 pa-0" justify="center">
                    <v-card class="mt-10" color="transparent" flat>
                        <v-icon color="primary" size="100">mdi-magnify</v-icon>
                        <h2>What are you looking for?</h2>
                    </v-card>
                </v-col>
            </v-row>
        </v-container>
        <v-container class="pa-0 ma-0" v-else>
            <v-card color="transparent" elevation="0" height="104" width="100%"></v-card>
            <v-tabs-items v-model="tabs">
                <v-tab-item>
                    <v-list class="ma-0 pa-0" v-if="loading">
                        <v-skeleton-loader :key="i"
                                           class="mx-auto" ref="skeleton" type="list-item-avatar-two-line"
                                           v-for="(e, i) in Array(20).fill(0)"/>
                    </v-list>
                    <v-lazy :options="{threshold: 0.1}"
                            transition="fade-transition"
                            v-else
                            v-model="active.songs">
                        <v-list class="ma-0 pa-0" color="transparent" two-line>
                            <song
                                    :artist="item.artists.map(e => e.name).join(', ')"
                                    :artwork="item.album.images && item.album.images.length > 0 ? item.album.images.filter(e => e.width === Math.min(...item.album.images.map(j => j.width)))[0].url : ''"
                                    :id="item.id"
                                    :key="index"
                                    :name="item.name"
                                    @add="addItem"
                                    @dialog="handleDialog"
                                    v-for="(item, index) in songs"
                            ></song>
                        </v-list>
                    </v-lazy>
                </v-tab-item>
                <v-tab-item>
                    <v-list class="ma-0 pa-0" v-if="loading">
                        <v-skeleton-loader :key="i"
                                           class="mx-auto" ref="skeleton" type="list-item-avatar-two-line"
                                           v-for="(e, i) in Array(20).fill(0)"/>
                    </v-list>
                    <v-lazy :options="{threshold: 0.1}"
                            transition="fade-transition"
                            v-else
                            v-model="active.albums">
                        <v-list class="ma-0 pa-0" color="transparent" two-line>
                            <template v-for="(item, index) in albums">
                                <album
                                        :artists="item.artists.map(e => e.name).join(', ')"
                                        :artwork="item.images && item.images.length > 0 ? item.images.filter(e => e.width === Math.min(...item.images.map(j => j.width)))[0].url : ''"
                                        :id="item.id"
                                        :key="index"
                                        :name="item.name"
                                        :socket="socket"
                                        @add="addItem"
                                        @dialog="handleDialog">
                                </album>
                                <v-divider :key="'div-' + index" v-if="index + 1 < albums.length"/>
                            </template>
                        </v-list>
                    </v-lazy>
                </v-tab-item>
                <v-tab-item>
                    <v-list class="ma-0 pa-0" v-if="loading">
                        <v-skeleton-loader :key="i"
                                           class="mx-auto" ref="skeleton" type="list-item-avatar"
                                           v-for="(e, i) in Array(20).fill(0)"/>
                    </v-list>
                    <v-lazy :options="{threshold: 0.1}"
                            transition="fade-transition"
                            v-else
                            v-model="active.artists">
                        <v-list class="ma-0 pa-0" color="transparent" one-line>
                            <template v-for="(item, index) in artists">
                                <artist
                                        :artwork="item.images && item.images.length > 0 ? item.images.filter(e => e.width === Math.min(...item.images.map(j => j.width)))[0].url : ''"
                                        :id="item.id"
                                        :key="index"
                                        :name="item.name"
                                        :socket="socket"
                                        @add="addItem"
                                        @dialog="handleDialog">
                                </artist>
                            </template>
                        </v-list>
                    </v-lazy>
                </v-tab-item>
                <v-tab-item>
                    <v-list class="ma-0 pa-0" v-if="loading">
                        <v-skeleton-loader :key="i"
                                           class="mx-auto" ref="skeleton" type="list-item-avatar"
                                           v-for="(e, i) in Array(20).fill(0)"/>
                    </v-list>
                    <v-lazy :options="{threshold: 0.1}"
                            transition="fade-transition"
                            v-else
                            v-model="active.playlists">
                        <v-list class="ma-0 pa-0" color="transparent" one-line>
                            <template v-for="(item, index) in playlists">
                                <playlist
                                        :artwork="item.images && item.images.length > 0 ? item.images[0].url : ''"
                                        :id="item.id"
                                        :key="index"
                                        :name="item.name"
                                        :socket="socket"
                                        @add="addItem"
                                        @dialog="handleDialog">
                                </playlist>
                                <v-divider :key="'div-' + index" v-if="index + 1 < playlists.length"/>
                            </template>
                        </v-list>
                    </v-lazy>
                </v-tab-item>
            </v-tabs-items>
        </v-container>
        <v-snackbar :timeout="snackbarTimeout" v-model="snackbarState">
            {{ snackbarMessage }}
            <v-btn @click="snackbarAction()" color="blue" text>
                {{ snackbarButton }}
            </v-btn>
        </v-snackbar>
    </v-card>
</template>

<script>
    import io from 'socket.io-client'
    import session from 'localStorage'
    import axios from 'axios'
    import Playlist from './components/Playlist'
    import Song from './components/Song'
    import Album from './components/Album'
    import Artist from './components/Artist'

    function debounce(func, wait = 100) {
        let timeout
        return function (...args) {
            clearTimeout(timeout)
            timeout = setTimeout(() => {
                func.apply(this, args)
            }, wait)
        }
    }

    export default {
        name: "Search",
        data: () => ({
            socket: null,
            token: '',
            loading: false,
            emptySearch: true,
            dialog: false,
            isTypingSearch: false,
            query: '',
            tabs: null,
            searchResult: null,
            openDialogs: [],
            safeToLeave: false,
            snackbarState: false,
            snackbarMessage: '',
            snackbarButton: '',
            snackbarAction: () => {
            },
            snackbarTimeout: 3000,
            active: {
                songs: false,
                albums: false,
                artists: false,
                playlists: false
            }
        }),
        components: {
            'playlist': Playlist,
            'song': Song,
            'album': Album,
            'artist': Artist
        },
        computed: {
            songs() {
                return this.searchResult.tracks.items;
            },
            albums() {
                return this.searchResult.albums.items;
            },
            artists() {
                return this.searchResult.artists.items;
            },
            playlists() {
                return this.searchResult.playlists.items;
            }
        },
        mounted() {
            window.scrollTo(0, 0);
            this.token = session.getItem('token');
            this.socket = io(this.$socketUrl);
            this.socket.on('connect', () => {
            });
            this.socket.on('search-success', (message) => {
                this.gotResult(message);
            });
            this.socket.on('playlist-song-added', (message) => {
                if (message.wasAdded) {
                    this.showSnackbar('Song Added', 'Undo', () => {
                        // emit an undo socket message
                        this.snackbarState = false;
                        this.socket.emit('playlist-remove-song', {
                            token: this.token,
                            data: {
                                songId: message.songId
                            }
                        });
                    });
                }
            });
            this.socket.on('reload', () => {
                location.reload();
            });
            this.socket.on('party-leave', () => {
                this.navigateAway();
            });
        },
        methods: {
            handleEvent(event) {
                this.socket.emit(event.eventName, event.data);
            },
            search() {
                if (this.query !== "") {
                    this.loading = true;
                    this.emptySearch = false;
                    this.searchResult = null;
                    this.socket.emit('search', {
                        token: this.token,
                        data: {
                            query: this.query
                        }
                    })
                } else {
                    this.loading = false;
                    this.emptySearch = true;
                }
            },
            addItem(songId) {
                this.socket.emit('playlist-add-song', {
                    token: this.token,
                    data: {
                        songId
                    }
                });
            },
            gotResult(data) {
                this.searchResult = data;
                this.loading = false;
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
        },
        beforeRouteLeave(to, from, next) {
            // clever way to use dialogs to feel like navigation
            if (this.openDialogs.length === 0) {
                this.safeToLeave = true;
            } else {
                let x = this.openDialogs.pop();
                x.close();
            }
            if (this.safeToLeave) {
                next();
            } else {
                next(false);
            }
        },
        beforeDestroy() {
            this.socket.disconnect();
            clearInterval(this.eventLoop);
        },
        watch: {
            query: debounce(function () {
                this.isTypingSearch = false
            }, 500),
            isTypingSearch: function (value) {
                if (!value) {
                    this.search()
                }
            }
        },
    }
</script>
