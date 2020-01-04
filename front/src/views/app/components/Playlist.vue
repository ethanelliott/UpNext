<template>
    <v-dialog fullscreen hide-overlay transition="dialog-bottom-transition" v-model="dialog">
        <template v-slot:activator="{ on }">
            <v-list-item @click="open">
                <v-list-item-avatar tile>
                    <v-img size="60" :src="data.images[0].url"/>
                </v-list-item-avatar>
                <v-list-item-content>
                    <v-list-item-title>{{data.name}}</v-list-item-title>
                </v-list-item-content>
            </v-list-item>
        </template>
        <v-card>
            <v-app-bar fixed color="darker">
                <v-btn @click="close" color="primary" icon>
                    <v-icon>mdi-close</v-icon>
                </v-btn>
                <v-toolbar-title>{{ data.name }}</v-toolbar-title>
                <v-spacer/>
            </v-app-bar>
            <v-divider class="mt-12"/>
            <v-divider class="mt-2"/>
            <v-img class="my-5" height="200" contain :src="data.images[0].url"/>

            <v-card color="transparent" flat>
                <v-list v-if="songs.length > 0" two-line color="transparent">
                    <template v-for="(item, index) in songs">
                        <song :key="index" v-bind:song="item.track" v-on:add="addItem"/>
                        <v-divider :key="'div-' + index" v-if="index + 1 < songs.length"/>
                    </template>
                </v-list>
                <v-container class="fill-height" v-else>
                    <v-container>
                        <v-row justify="center" align="center">
                            <v-col justify="center" align="center">
                                <v-progress-circular :size="70" :width="7" color="primary" indeterminate/>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-container>
            </v-card>
        </v-card>
    </v-dialog>
</template>

<script>
    import session from 'localStorage'
    import axios from 'axios'
    import Song from './Song'

    export default {
        props: ['data'],
        name: "Playlist",
        data: () => ({
            dialog: false,
            token: '',
            songs: [],
        }),
        components: {
            'song': Song
        },
        mounted() {
            this.token = session.getItem('token');
        },
        methods: {
            open() {
                this.dialog = true;
                axios.post('/spotify/playlist/tracks', {token: this.token, playlistId: this.data.id}).then(res => {
                    this.songs = res.data.items;
                }).catch(err => {
                })
                this.handleDialog({
                    state: 'open',
                    id: 'playlist',
                    close: this.close
                });
            },
            close() {
                this.dialog = false;
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
