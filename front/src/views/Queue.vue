<template>
    <v-layout v-if="loading" justify-center align-center>
        <v-flex class="text-xs-center">
            <v-progress-circular :size="200" :width="15" color="primary" indeterminate></v-progress-circular>
        </v-flex>
    </v-layout>
    <v-layout v-else-if="!loading" row>
        <v-dialog v-model="dialog" width="500" dark>
            <v-card>
                <v-card-actions>
                    <v-btn color="primary" flat @click="downvoteSong">
                        Downvote
                    </v-btn>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" flat @click="upvoteSong">
                        Upvote
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-flex xs12 sm6 offset-sm3>
            <v-card>
                <v-list two-line>
                    <template v-for="(track, index) in queue">
                        <v-list-tile :key="track.title" avatar @click="showVoteDialog(track)">
                            <v-list-tile-avatar tile>
                                <img :src="track.artwork">
                            </v-list-tile-avatar>
                            <v-list-tile-content>
                                <v-list-tile-title>{{ track.name }}</v-list-tile-title>
                                <v-list-tile-sub-title class="text--primary">{{ track.artist }}</v-list-tile-sub-title>
                            </v-list-tile-content>
                            <v-list-tile-action>
                                <v-btn flat icon color="primary">
                                    <v-icon large>thumbs_up_down</v-icon>
                                </v-btn>
                            </v-list-tile-action>
                        </v-list-tile>
                        <v-divider
                                v-if="index + 1 < queue.length"
                                :key="index"
                        ></v-divider>
                    </template>
                </v-list>
            </v-card>
        </v-flex>
    </v-layout>
</template>

<script>
    import session from 'sessionstorage'
    export default {
        name: 'About',
        data: () => ({
            eventLoop: null,
            socket: null,
            dialog: null,
            loading: true,
            partyID: null,
            selectedTrack: null,
            queue: []
        }),
        mounted() {
            let context = this
            this.socket = io('http://localhost:8888')
            this.partyID = session.getItem('partyID')
            this.loading = false
            this.eventLoop = setInterval(function() {
                context.socket.emit('get-playlist', {id: context.partyID})
            }, 500)

            this.socket.on('give-playlist', (data) => {
                this.queue = data.playlist
            })
        },
        methods: {
            showVoteDialog(track) {
                this.selectedTrack = track.id
                this.dialog = true
            },
            upvoteSong() {
                console.log(this.selectedTrack, 'upvote')
                this.dialog = false
            },
            downvoteSong() {
                console.log(this.selectedTrack, 'downvote')
                this.dialog = false
            }
        }
    }
</script>
