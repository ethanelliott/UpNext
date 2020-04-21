<template>
    <v-card class="text-left pa-0 ma-0" color="transparent" elevation="0">
        <v-app-bar color="darker" extended fixed>
            <v-btn dark icon to="/app/home">
                <v-icon>mdi-close</v-icon>
            </v-btn>
            <v-text-field @input="isTypingSearch = true" autofocus clearable full-width
                          hide-details label="search for something" prepend-inner-icon="mdi-magnify"
                          single-line v-model="query"/>
            <v-tabs background-color="transparent" fixed-tabs slot="extension" v-model="tabs">
                <v-tab>Songs</v-tab>
                <v-tab>Albums</v-tab>
                <v-tab>Artists</v-tab>
                <v-tab>Playlists</v-tab>
            </v-tabs>
        </v-app-bar>
        <v-container class="mt-10 pa-0 pt-6" v-if="emptySearch">
            <v-container class="mt-10">
                <v-row>
                    <v-col align="center" justify="center">
                        <v-card class="mt-10" color="transparent" flat>
                            <v-icon color="primary" size="100">mdi-magnify</v-icon>
                            <h2>What are you looking for?</h2>
                        </v-card>
                    </v-col>
                </v-row>
            </v-container>
        </v-container>
        <v-container class="mt-10 pa-0 pt-6" v-else>
            <v-tabs-items v-model="tabs">
                <v-tab-item>
                    <v-list class="mt-10" v-if="loading">
                        <v-skeleton-loader class="mx-auto" ref="skeleton" type="list-item-avatar-three-line"/>
                    </v-list>
                    <v-list class="mt-10" v-else>
                        <v-list color="transparent" two-line>
                            <template v-for="(item, index) in songs">
                                <song :key="index" v-bind:song="item" v-on:add="addItem" v-on:dialog="handleDialog"/>
                                <v-divider :key="'div-' + index" v-if="index + 1 < songs.length"/>
                            </template>
                        </v-list>
                    </v-list>
                </v-tab-item>
                <v-tab-item>
                    <v-list class="mt-10" v-if="loading">
                        <v-skeleton-loader class="mx-auto" ref="skeleton" type="list-item-avatar-three-line"/>
                    </v-list>
                    <v-list class="mt-10" v-else>
                        <v-list color="transparent" two-line>
                            <template v-for="(item, index) in albums">
                                <album :key="index" v-bind:data="item" v-on:add="addItem" v-on:dialog="handleDialog"/>
                                <v-divider :key="'div-' + index" v-if="index + 1 < albums.length"/>
                            </template>
                        </v-list>
                    </v-list>
                </v-tab-item>
                <v-tab-item>
                    <v-list class="mt-10" v-if="loading">
                        <v-skeleton-loader class="mx-auto" ref="skeleton" type="list-item-avatar-three-line"/>
                    </v-list>
                    <v-list class="mt-10">
                        <v-list color="transparent" one-line>
                            <template v-for="(item, index) in artists">
                                <artist :key="index" v-bind:data="item" v-on:add="addItem" v-on:dialog="handleDialog"/>
                                <v-divider :key="'div-' + index" v-if="index + 1 < artists.length"/>
                            </template>
                        </v-list>
                    </v-list>
                </v-tab-item>
                <v-tab-item>
                    <v-list class="mt-10" v-if="loading">
                        <v-skeleton-loader class="mx-auto" ref="skeleton" type="list-item-avatar-three-line"/>
                    </v-list>
                    <v-list class="mt-10">
                        <v-list color="transparent" one-line>
                            <template v-for="(item, index) in playlists">
                                <playlist :key="index" v-bind:data="item" v-on:add="addItem"
                                          v-on:dialog="handleDialog"/>
                                <v-divider :key="'div-' + index" v-if="index + 1 < playlists.length"/>
                            </template>
                        </v-list>
                    </v-list>
                </v-tab-item>
            </v-tabs-items>
        </v-container>
        <v-snackbar :timeout="2000" v-model="snackbarState">
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
            token: '',
            loading: false,
            emptySearch: true,
            dialog: false,
            isTypingSearch: false,
            query: '',
            tabs: null,
            songs: [],
            albums: [],
            artists: [],
            playlists: [],
            openDialogs: [],
            safeToLeave: false,
            snackbarState: false,
            snackbarMessage: '',
            snackbarButton: '',
            snackbarAction: () => {
            },
        }),
        components: {
            'playlist': Playlist,
            'song': Song,
            'album': Album,
            'artist': Artist
        },
        mounted() {
            window.scrollTo(0, 0);
            let t = this;
            t.token = session.getItem('token');
            t.socket = io(t.$socketPath);
            t.socket.on('connect', () => {
            });
            t.socket.on('search-success', (message) => {
                t.gotResult(message);
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
        },
        methods: {
            search() {
                if (this.query !== "") {
                    this.loading = true;
                    this.emptySearch = false;
                    this.songs = [];
                    this.albums = [];
                    this.artists = [];
                    this.playlists = [];
                    this.socket.emit('search', {
                        token: this.token,
                        data: {
                            query: this.query
                        }
                    })
                } else {
                    this.loading = false;
                    this.emptySearch = true;
                    this.items = []
                }
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
            gotResult(data) {
                this.songs = data.tracks.items;
                this.playlists = data.playlists.items;
                this.albums = data.albums.items;
                this.artists = data.artists.items;
                this.loading = false;
            },
            navigateAway() {
                this.safeToLeave = true;
                this.$router.push('/leave');
            },
            handleDialog(data) {
                // console.log(data, this.openDialogs);
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
