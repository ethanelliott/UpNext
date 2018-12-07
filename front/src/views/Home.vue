<template>
    <v-container fluid fill-height>
        <v-layout v-if="loading" justify-center align-center>
            <v-flex class="text-xs-center">
                <v-progress-circular :size="200" :width="15" color="primary" indeterminate></v-progress-circular>
            </v-flex>
        </v-layout>
        <v-layout v-if="!loading" justify-center align-center>
            <v-flex lg6 md8 sm8 xs12>
                <v-container>
                    <v-layout justify-center>
                        <v-flex class="text-xs-center">
                            <img :src="albumArtwork" class="elevation-15" style="width:90%;max-width:400px;" />
                        </v-flex>
                    </v-layout>
                    <v-layout justify-center>
                        <v-flex class="text-xs-center mt-3">
                            <v-progress-linear color="primary" height="15" v-model="trackPos"></v-progress-linear>
                        </v-flex>
                    </v-layout>
                    <v-layout justify-center>
                        <v-flex class="text-xs-center mt-3">
                            <p class="title">{{trackName}}</p>
                            <p class="font-weight-thin">{{trackArtist}}</p>
                        </v-flex>
                    </v-layout>
                </v-container>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
    import session from 'sessionstorage'
    export default {
        name: "Home",
        data: () => ({
            socket: null,
            loading: true,
            partyID: null,
            albumArtwork: null,
            trackName: null,
            trackArtist: null,
            trackPos: 0
        }),
        mounted() {
            this.socket = io('http://api.upnext.ml')
            this.partyID = session.getItem('partyID')
            this.socket.emit('start-player-loop', {id: this.partyID})
            this.socket.on('event-loop', (data) => {
                let d = data.data
                this.trackPos = (d.progress_ms / d.item.duration_ms) * 100
                this.albumArtwork = d.item.album.images[0].url
                this.trackName = d.item.name
                this.trackArtist = d.item.artists[0].name
                if (this.trackName !== null) {
                    this.loading = false
                }
            })
        }
    }
</script>
