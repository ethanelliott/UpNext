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
        <v-card v-if="dialog">
            <v-app-bar fixed flat color="transparent">
                <v-btn small @click="dialog = false" color="primary" dark fab>
                    <v-icon>mdi-close</v-icon>
                </v-btn>
                <v-spacer/>
            </v-app-bar>
            <v-img height="200" :src="data.images[0].url"/>
            <v-toolbar flat color="transparent">
                <v-toolbar-title>{{ data.name }}</v-toolbar-title>
                <v-spacer/>
            </v-toolbar>
            <v-divider/>
            <v-list two-line color="transparent" v-if="artistData.top.length > 0">
                <v-subheader>Top Songs</v-subheader>
                <template v-for="(item, index) in artistData.top">
                    <song :key="index" v-bind:song="item" v-on:add="addItem" v-on:dialog="handleDialog"/>
                    <v-divider :key="'div-' + index" v-if="index + 1 < artistData.top.length"/>
                </template>
            </v-list>
            <v-divider/>
            <v-list two-line color="transparent" v-if="artistData.albums.length > 0">
                <v-subheader>Albums</v-subheader>
                <template v-for="(item, index) in artistData.albums">
                    <album :key="index" v-bind:data="item" v-on:add="addItem"  v-on:dialog="handleDialog"/>
                    <v-divider :key="'div-' + index" v-if="index + 1 < artistData.albums.length"/>
                </template>
            </v-list>
            <v-divider/>
            <v-list two-line color="transparent" v-if="artistData.singles.length > 0">
                <v-subheader>Singles</v-subheader>
                <template v-for="(item, index) in artistData.singles">
                    <album :key="index" v-bind:data="item" v-on:add="addItem"  v-on:dialog="handleDialog"/>
                    <v-divider :key="'div-' + index" v-if="index + 1 < artistData.singles.length"/>
                </template>
            </v-list>
            <v-divider/>
            <v-list two-line color="transparent" v-if="artistData.appears.length > 0">
                <v-subheader>Appears On</v-subheader>
                <template v-for="(item, index) in artistData.appears">
                    <album :key="index" v-bind:data="item" v-on:add="addItem"  v-on:dialog="handleDialog"/>
                    <v-divider :key="'div-' + index" v-if="index + 1 < artistData.appears.length"/>
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
        name: "Artist",
        data: () => ({
            dialog: false,
            token: '',
            artistData: null
        }),
        components: {
            'song': () => import('./Song'),
            'album': () => import('./Album')
        },
        mounted() {
            this.token = session.getItem('token');
        },
        methods: {
            open() {
                let t = this;
                t.dialog = true;
                axios.post('/spotify/artist', {token: t.token, artistId: t.data.id}).then(res => {
                    t.artistData = res.data;
                }).catch(err => {
                })
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
