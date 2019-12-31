<template>
    <v-dialog fullscreen transition="dialog-bottom-transition" v-model="dialog">
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
        <v-card color="darker">
            <v-app-bar fixed flat>
                <v-btn @click="close" color="primary" icon>
                    <v-icon>mdi-close</v-icon>
                </v-btn>
                <v-toolbar-title>{{ data.name }}</v-toolbar-title>
                <v-spacer/>
            </v-app-bar>
            <v-divider class="mt-12"/>
            <v-divider class="mt-2"/>
            <v-img class="my-5" height="200" contain :src="data.images[0].url"/>
            <v-list two-line color="transparent">
                <template v-for="(item, index) in songs">
                    <song :key="index" v-bind:song="item" v-on:add="addItem"/>
                    <v-divider :key="'div-' + index" v-if="index + 1 < songs.length"/>
                </template>
            </v-list>
        </v-card>
    </v-dialog>
</template>

<script>
    import session from 'localStorage'
    import axios from 'axios'

    export default {
        props: ['data'],
        name: "Album",
        data: () => ({
            dialog: false,
            token: '',
            songs: [],
        }),
        components: {
            'song': () => import('./Song')
        },
        mounted() {
            this.token = session.getItem('token');
        },
        methods: {
            open() {
                let t = this;
                t.dialog = true;
                axios.post('/spotify/album/tracks', {token: this.token, albumId: this.data.id}).then(res => {
                    t.songs = res.data.items.map(e => {
                        e.album = t.data;
                        return e;
                    });
                }).catch(err => {
                })
                this.handleDialog({
                    state: 'open',
                    id: 'album',
                    close: this.close
                });
            },
            close() {
                this.dialog = false;
                this.handleDialog({
                    state: 'close',
                    id: 'album'
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
