<template>
    <v-dialog fullscreen hide-overlay transition="dialog-bottom-transition" v-model="dialog">
        <template v-slot:activator="{ on }">
            <v-btn outlined color="primary" depressed height="80" width="80" @click="open">
                <v-icon size="50">mdi-music-note-plus</v-icon>
            </v-btn>
        </template>
        <v-card>
            <v-app-bar fixed color="darker">
                <v-btn @click="close" dark icon>
                    <v-icon>mdi-close</v-icon>
                </v-btn>
                <v-toolbar-title>Add Songs</v-toolbar-title>
            </v-app-bar>
            <v-container class="mt-10">
                <v-row>
                    <v-col align="center" justify="center">
                        <search v-on:search="search" v-bind:searchResult="searchResult"/>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-card color="grey darken-2">
                            <v-card-title>
                                Recommended Songs
                                <v-spacer/>
                                <v-btn @click="updateContent" icon>
                                    <v-icon>mdi-refresh</v-icon>
                                </v-btn>
                            </v-card-title>
                            <v-list two-line color="transparent">
                                <template v-for="(item, index) in recommended">
                                    <song :key="index" v-bind:song="item" v-on:add="addItem"/>
                                    <v-divider :key="'div-' + index" v-if="index + 1 < recommended.length"/>
                                </template>
                            </v-list>
                        </v-card>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-card color="grey darken-2">
                            <v-card-title>
                                {{motd}}
                            </v-card-title>
                            <v-list one-line color="transparent">
                                <template v-for="(item, index) in topPlaylists">
                                    <playlist :key="index" v-bind:data="item" v-on:add="addItem"/>
                                    <v-divider :key="'div-' + index" v-if="index + 1 < topPlaylists.length"/>
                                </template>
                            </v-list>
                        </v-card>
                    </v-col>
                </v-row>
            </v-container>
        </v-card>
    </v-dialog>
</template>

<script>
    import session from 'localStorage'
    import axios from 'axios'
    import Search from './Search'
    import Playlist from './components/Playlist'
    import Song from './components/Song'

    export default {
        props: ['value', 'searchResult'],
        name: "Queue",
        data: () => ({
            token: '',
            recommended: [],
            topPlaylists: [],
            motd: '',
        }),
        components: {
            'search': Search,
            'playlist': Playlist,
            'song': Song
        },
        mounted() {
            window.scrollTo(0, 0);
            this.token = session.getItem('token');
            this.updateContent();
        },
        computed: {
            dialog: {
                get() {
                    return this.value
                },
                set(value) {
                    this.$emit('input', value)
                }
            }
        },
        methods: {
            open() {
                this.dialog = true;
                this.recommended = [];
                this.topPlaylists = [];
                this.updateContent();
            },
            close() {
                this.dialog = false;
            },
            updateContent() {
                let t = this;
                axios.post('/party/featured', {token: this.token})
                    .then(res => {
                        t.motd = res.data.featured.message;
                        t.topPlaylists = res.data.featured.playlists.items.slice(0, 5);
                    }).catch(err => {
                    }
                )
                axios.post('/party/recommended', {token: this.token})
                    .then(res => {
                        t.recommended = res.data.recommended.tracks.slice(0, 5);
                    }).catch(err => {
                    }
                )
            },
            addItem(songId) {
                this.$emit('add', songId)
            },
            search(query) {
                this.$emit('search', query)
            }
        },
        watch: {}

    }
</script>
