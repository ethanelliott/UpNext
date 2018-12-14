<template>
    <v-container fluid fill-height :style="backStyle">
        <v-layout v-if="loading" justify-center align-center>
            <v-flex class="text-xs-center">
                <v-progress-circular :size="200" :width="15" color="primary" indeterminate></v-progress-circular>
            </v-flex>
        </v-layout>
        <v-layout v-if="!loading" justify-center align-center>
            <v-flex lg8 md10 sm10 xs12>
                <v-container>
                    <v-layout justify-center>
                        <v-flex class="text-xs-center">
                            <img :src="albumArtwork" class="elevation-24 album-art-image"
                                 style="width:90%;max-width:650px;"/>
                        </v-flex>
                    </v-layout>
                </v-container>
            </v-flex>
        </v-layout>
        <v-footer class="elevation-20" dark fixed height="auto">
            <v-container class="ma-0 pa-2" fluid>
                <v-layout align-center justify-center>
                    <v-flex class="text-xs-center headline">
                        <p>{{ trackName }} - {{ artist }}</p>
                    </v-flex>
                </v-layout>
                <v-layout align-center justify-center>
                    <v-flex>
                        <v-progress-linear class="my-0" height="10" v-model="trackpos"></v-progress-linear>
                    </v-flex>
                </v-layout>
            </v-container>
        </v-footer>
    </v-container>
</template>

<script>
    const PROD = true
    import io from 'socket.io-client'
    import session from 'sessionstorage'
    import * as Vibrant from 'node-vibrant'

    export default {
        name: "PartyView",
        data: () => ({
            socket: null,
            loading: true,
            partyID: null,
            albumArtwork: null,
            trackName: null,
            artist: null,
            backStyle: '',
            trackpos: 0
        }),
        beforeDestroy() {
            this.socket.disconnect()
        },
        mounted() {
            let t = this
            t.socket = io((PROD ? 'http://api.upnext.ml' : 'http://localhost:8888'))
            t.partyID = session.getItem('partyID')
            t.socket.emit('start-player-loop', {id: t.partyID})
            t.socket.on('event-loop', (data) => {
                let d = data.data
                t.trackpos = (d.progress_ms / d.item.duration_ms) * 100
                t.albumArtwork = d.item.album.images[0].url
                t.trackName = d.item.name
                t.artist = d.item.artists[0].name
                Vibrant.from(t.albumArtwork).getPalette().then(function (palette) {
                    if (palette && palette.DarkVibrant) {
                        t.backStyle = "background: " + palette.DarkVibrant.getHex()
                    } else {
                        t.backStyle = "background: rgba(0,0,0,0)"
                    }
                })
                if (t.albumArtwork !== null) {
                    t.loading = false
                }
            })
        },
        methods: {
        }
    }
</script>
<style>
    html {
        overflow-y: hidden;
    }
</style>
