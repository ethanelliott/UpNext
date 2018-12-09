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
                            <img :src="albumArtwork" class="elevation-24 album-art-image" style="width:90%;max-width:600px;" />
                        </v-flex>
                    </v-layout>
                </v-container>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
    import io from 'socket.io-client'
    import session from 'sessionstorage'
    import * as Vibrant from 'node-vibrant'
    export default {
        name: "Home",
        data: () => ({
            socket: null,
            loading: true,
            partyID: null,
            albumArtwork: null,
            backStyle: '',
        }),
        mounted() {
            let t = this
            t.socket = io('http://api.upnext.ml')
            t.partyID = session.getItem('partyID')
            t.socket.emit('start-player-loop', {id: t.partyID})
            t.socket.on('event-loop', (data) => {
                let d = data.data
                t.albumArtwork = d.item.album.images[0].url
                Vibrant.from(t.albumArtwork).getPalette().then(function (palette) {
                    t.backStyle = "background: " + palette.DarkVibrant.getHex()
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
