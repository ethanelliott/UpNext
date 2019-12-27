<template>
    <v-dialog fullscreen hide-overlay transition="dialog-bottom-transition" v-model="dialog">
        <template v-slot:activator="{ on }">
            <v-btn @click="open" block class="my-5" color="primary" large rounded>
                <v-icon left>mdi-magnify</v-icon>
                Search
            </v-btn>
        </template>
        <v-card>
            <v-app-bar fixed color="darker" extended>
                <v-btn @click="close" dark icon>
                    <v-icon>mdi-close</v-icon>
                </v-btn>
                <v-text-field @input="isTypingSearch = true" autofocus clearable full-width
                              hide-details label="search for something" prepend-inner-icon="mdi-magnify"
                              single-line v-model="query"/>
                <v-tabs slot="extension" v-model="tabs" background-color="transparent" fixed-tabs>
                    <v-tab>Songs</v-tab>
                    <v-tab>Albums</v-tab>
                    <v-tab>Artists</v-tab>
                    <v-tab>Playlists</v-tab>
                </v-tabs>
            </v-app-bar>
            <v-container class="mt-10" v-if="emptySearch">
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
            <v-container class="mt-10" v-else>
                <v-tabs-items v-model="tabs">
                    <v-tab-item> // songs
                        <v-list class="mt-10" v-if="loading">
                            <v-skeleton-loader class="mx-auto" ref="skeleton" type="list-item-avatar-three-line"/>
                        </v-list>
                        <v-list class="mt-10" v-else>
                            <v-list two-line color="transparent">
                                <template v-for="(item, index) in songs">
                                    <song :key="index" v-bind:song="item" v-on:add="addItem"/>
                                    <v-divider :key="'div-' + index" v-if="index + 1 < songs.length"/>
                                </template>
                            </v-list>
                        </v-list>
                    </v-tab-item>
                    <v-tab-item>
                        <v-list class="mt-10" v-if="loading">
                            <v-skeleton-loader class="mx-auto" ref="skeleton" type="list-item-avatar-three-line"/>
                        </v-list>
                        <v-list class="mt-10">

                        </v-list>
                    </v-tab-item>
                    <v-tab-item>
                        <v-list class="mt-10" v-if="loading">
                            <v-skeleton-loader class="mx-auto" ref="skeleton" type="list-item-avatar-three-line"/>
                        </v-list>
                        <v-list class="mt-10">

                        </v-list>
                    </v-tab-item>
                    <v-tab-item>
                        <v-list class="mt-10" v-if="loading">
                            <v-skeleton-loader class="mx-auto" ref="skeleton" type="list-item-avatar-three-line"/>
                        </v-list>
                        <v-list class="mt-10">
                            <v-list one-line color="transparent">
                                <template v-for="(item, index) in playlists">
                                    <playlist :key="index" v-bind:data="item" v-on:add="addItem"/>
                                    <v-divider :key="'div-' + index" v-if="index + 1 < playlists.length"/>
                                </template>
                            </v-list>
                        </v-list>
                    </v-tab-item>
                </v-tabs-items>
            </v-container>
        </v-card>
    </v-dialog>
</template>

<script>
    import session from 'localStorage'
    import axios from 'axios'

    import Playlist from './components/Playlist'
    import Song from './components/Song'

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
            playlists: []
        }),
        components: {
            'playlist': Playlist,
            'song': Song
        },
        mounted() {
            this.token = session.getItem('token');
        },
        methods: {
            open() {
                this.dialog = true;
            },
            close() {
                this.dialog = false;
                this.songs = [];
                this.albums = [];
                this.artists = [];
                this.playlists = [];
                this.query = '';
            },
            search() {
                if (this.query !== "") {
                    this.loading = true;
                    this.emptySearch = false;
                    this.songs = [];
                    this.albums = [];
                    this.artists = [];
                    this.playlists = [];
                    this.$emit('search', this.query)
                } else {
                    this.loading = false;
                    this.emptySearch = true;
                    this.items = []
                }
            },
            gotResult(data) {
                this.songs = data.tracks.items;
                this.playlists = data.playlists.items;
                this.loading = false;
            },
            addItem(songId) {
                this.$emit('add', songId)
            }
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
