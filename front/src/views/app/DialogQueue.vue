<template>
    <v-dialog fullscreen hide-overlay transition="dialog-bottom-transition" v-model="dialog">
        <template v-slot:activator="{ on }">
            <v-btn outlined depressed height="80" width="80" @click="open">
                <v-icon size="50">mdi-playlist-music</v-icon>
            </v-btn>
        </template>
        <v-card>
            <v-dialog dark v-model="voteDialog" width="500">
                <v-card>
                    <v-card-actions>
                        <v-btn @click="downvoteSong" color="primary" text>
                            <v-icon>mdi-arrow-down</v-icon>
                            Downvote
                        </v-btn>
                        <v-spacer/>
                        <v-btn @click="upvoteSong" color="primary" text>
                            Upvote
                            <v-icon>mdi-arrow-up</v-icon>
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
            <v-app-bar fixed color="darker">
                <v-btn @click="close" dark icon>
                    <v-icon>mdi-close</v-icon>
                </v-btn>
                <v-toolbar-title>Queue</v-toolbar-title>
                <v-spacer/>
                <v-btn @click="openPlaylist">
                    <v-icon>mdi-share</v-icon>
                </v-btn>
            </v-app-bar>
            <v-container>
                <v-list class="mt-10" three-line>
                    <template v-for="(track, index) in playlist">
                        <v-list-item v-bind:key="'item-' + index" @click="showVoteDialog(track)">
                            <v-list-item-avatar tile size="60">
                                <v-img :src="track.albumArtwork"/>
                            </v-list-item-avatar>
                            <v-list-item-content>
                                <v-list-item-title class="font-weight-bold">{{track.name}}</v-list-item-title>
                                <v-list-item-subtitle>{{track.artist}}</v-list-item-subtitle>
                                <v-list-item-subtitle>Added By: {{track.addedBy}}</v-list-item-subtitle>
                            </v-list-item-content>
                            <v-list-item-action>
                                <!--                                <span class="overline green&#45;&#45;text">+{{track.upVoters.length}}</span>-->
                                <span class="title">{{track.votes}}</span>
                                <!--                                <span class="overline red&#45;&#45;text">-{{track.downVoters.length}}</span>-->
                            </v-list-item-action>
                        </v-list-item>
                        <v-divider :key="'div-' + index" v-if="index + 1 < playlist.length"/>
                    </template>
                </v-list>
            </v-container>
        </v-card>
    </v-dialog>
</template>

<script>
    import session from 'localStorage'
    import io from 'socket.io-client'

    export default {
        props: ['playlist', 'playlistId'],
        name: "Queue",
        data: () => ({
            dialog: false,
            voteDialog: false,
            voteSongId: ''
        }),
        methods: {
            open() {
                window.scrollTo(0, 0);
                this.dialog = true;
                this.handleDialog({
                    state: 'open',
                    id: 'queue',
                    close: this.close
                });
            },
            close() {
                this.dialog = false;
                this.handleDialog({
                    state: 'close',
                    id: 'queue'
                });
            },
            openPlaylist() {
                window.open(`https://open.spotify.com/playlist/${this.playlistId}`);
            },
            showVoteDialog(song) {
                this.voteDialog = true;
                this.voteSongId = song.id;
            },
            downvoteSong() {
                this.$emit('downvote', this.voteSongId);
                this.voteDialog = false;
            },
            upvoteSong() {
                this.$emit('upvote', this.voteSongId)
                this.voteDialog = false;
            },
            handleDialog(state) {
                this.$emit('dialog', state)
            }
        }

    }
</script>
